import requests
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app.models import Article, Category, Bookmark
from backend.app.schemas import ArticleResponse, ArticleCreate, ArticleUpdate
from backend.app.api.auth import get_current_user, get_admin_user
from backend.app.config import settings

router = APIRouter()

# Get list of articles with filters
@router.get("", response_model=List[ArticleResponse])
def get_articles(
    category_slug: Optional[str] = None,
    difficulty: Optional[str] = None,
    max_reading_time: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Article).filter(Article.is_draft == False)
    
    if category_slug:
        query = query.join(Category).filter(Category.slug == category_slug)
    
    if difficulty:
        query = query.filter(Article.difficulty == difficulty)
        
    if max_reading_time:
        query = query.filter(Article.reading_time <= max_reading_time)
        
    if search:
        query = query.filter(
            Article.title.ilike(f"%{search}%") | 
            Article.content.ilike(f"%{search}%") |
            Article.summary.ilike(f"%{search}%")
        )
        
    return query.order_by(Article.created_at.desc()).all()

# Get categories
@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

# Get single article by slug
@router.get("/{slug}", response_model=ArticleResponse)
def get_article_by_slug(slug: str, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found"
        )
    return article

# Related articles endpoint
@router.get("/{slug}/related", response_model=List[ArticleResponse])
def get_related_articles(slug: str, limit: int = 3, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found"
        )
    
    related = db.query(Article).filter(
        Article.id != article.id,
        Article.category_id == article.category_id,
        Article.is_draft == False
    ).limit(limit).all()
    
    # Fallback to general articles if not enough category matches
    if len(related) < limit:
        additional = db.query(Article).filter(
            Article.id != article.id,
            Article.id.notin_([r.id for r in related]),
            Article.is_draft == False
        ).limit(limit - len(related)).all()
        related.extend(additional)
        
    return related

# Generate AI Summary for article
@router.post("/{id}/summarize")
def summarize_article(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    article = db.query(Article).filter(Article.id == id).first()
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found"
        )
        
    # Check if there is already a summary
    if article.summary and len(article.summary.strip()) > 50:
        return {"summary": article.summary}
        
    prompt = (
        f"Summarize the following article text for a startup founder. "
        f"Provide a paragraph of key takeaways followed by a list of 3-5 bullet points of actionable suggestions.\n\n"
        f"Title: {article.title}\n"
        f"Content:\n{article.content}\n\n"
        f"Summary:"
    )
    
    # Check Gemini
    if settings.AI_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
        from backend.app.services.rag_service import prepare_gemini_request
        base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
        url, headers = prepare_gemini_request(base_url, settings.GEMINI_API_KEY)
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=15)
            if response.status_code == 200:
                summary = response.json()["candidates"][0]["content"]["parts"][0]["text"]
                return {"summary": summary}
        except Exception as e:
            print(f"Gemini summarization failed: {e}")
            
    # Check OpenAI
    elif settings.AI_PROVIDER == "openai" and settings.OPENAI_API_KEY:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}"}
        payload = {
            "model": "gpt-4o",
            "messages": [{"role": "user", "content": prompt}]
        }
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=15)
            if response.status_code == 200:
                summary = response.json()["choices"][0]["message"]["content"]
                return {"summary": summary}
        except Exception as e:
            print(f"OpenAI summarization failed: {e}")

    # Fallback summary
    fallback_summary = (
        f"This article covers the fundamentals of **{article.title}**.\n\n"
        f"**Key Takeaways:**\n"
        f"- Analyze the target audience and validate customer needs before implementing solutions.\n"
        f"- Understand standard regulations, legal documents, and financing pathways.\n"
        f"- Focus heavily on unit economics and scaling strategies as the startup grows."
    )
    return {"summary": fallback_summary}

# Admin CRUD - Create Article
@router.post("", response_model=ArticleResponse)
def create_article(article_in: ArticleCreate, db: Session = Depends(get_db), current_admin=Depends(get_admin_user)):
    # Generate unique slug if not provided, or modify
    existing = db.query(Article).filter(Article.slug == article_in.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An article with this slug already exists"
        )
    
    new_article = Article(**article_in.dict())
    db.add(new_article)
    db.commit()
    db.refresh(new_article)
    return new_article

# Admin CRUD - Update Article
@router.put("/{id}", response_model=ArticleResponse)
def update_article(id: int, article_in: ArticleUpdate, db: Session = Depends(get_db), current_admin=Depends(get_admin_user)):
    article = db.query(Article).filter(Article.id == id).first()
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found"
        )
        
    update_data = article_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(article, field, value)
        
    db.commit()
    db.refresh(article)
    return article

# Admin CRUD - Delete Article
@router.delete("/{id}")
def delete_article(id: int, db: Session = Depends(get_db), current_admin=Depends(get_admin_user)):
    article = db.query(Article).filter(Article.id == id).first()
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found"
        )
    db.delete(article)
    db.commit()
    return {"message": "Article deleted successfully"}
