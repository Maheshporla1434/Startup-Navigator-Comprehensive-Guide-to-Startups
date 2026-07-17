from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Article, Resource, User, SearchHistory, Bookmark, Feedback
from backend.app.api.auth import get_current_user, get_admin_user
from backend.app.schemas import DashboardStats

router = APIRouter()

@router.get("/user")
def get_user_dashboard(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    bookmark_count = db.query(Bookmark).filter(Bookmark.user_id == current_user.id).count()
    search_count = db.query(SearchHistory).filter(SearchHistory.user_id == current_user.id).count()
    
    # Fetch recent searches
    recent_searches = db.query(SearchHistory).filter(
        SearchHistory.user_id == current_user.id
    ).order_by(SearchHistory.created_at.desc()).limit(5).all()
    
    # Fetch user bookmarks detail
    bookmarks = db.query(Bookmark).filter(Bookmark.user_id == current_user.id).order_by(Bookmark.created_at.desc()).limit(5).all()
    
    activity = []
    for s in recent_searches:
        activity.append(f"Searched for: '{s.question}' at {s.created_at.strftime('%Y-%m-%d %H:%M')}")
    for b in bookmarks:
        item_title = b.article.title if b.article else (b.resource.title if b.resource else "Saved chat")
        activity.append(f"Bookmarked: '{item_title}' at {b.created_at.strftime('%Y-%m-%d %H:%M')}")
        
    return {
        "bookmarks_count": bookmark_count,
        "searches_count": search_count,
        "recent_activity": activity[:6],
        "bookmarks": [
            {
                "id": b.id,
                "article_slug": b.article.slug if b.article else None,
                "article_title": b.article.title if b.article else None,
                "resource_title": b.resource.title if b.resource else None,
                "resource_url": b.resource.url if b.resource else None,
                "chat_id": b.chat_id if b.chat else None
            } for b in bookmarks
        ]
    }

@router.get("/admin", response_model=DashboardStats)
def get_admin_dashboard(db: Session = Depends(get_db), current_admin=Depends(get_admin_user)):
    articles_count = db.query(Article).count()
    resources_count = db.query(Resource).count()
    users_count = db.query(User).count()
    searches_count = db.query(SearchHistory).count()
    bookmarks_count = db.query(Bookmark).count()
    
    # Build a simple mock analytics activity list
    recent_users = db.query(User).order_by(User.created_at.desc()).limit(3).all()
    recent_articles = db.query(Article).order_by(Article.created_at.desc()).limit(2).all()
    
    activity = []
    for u in recent_users:
        activity.append(f"New user registered: {u.email} ({u.full_name or 'No Name'})")
    for a in recent_articles:
        activity.append(f"Article published: '{a.title}'")
        
    return {
        "total_articles": articles_count,
        "total_resources": resources_count,
        "total_users": users_count,
        "total_searches": searches_count,
        "total_bookmarks": bookmarks_count,
        "recent_activity": activity
    }

# Feedback endpoint (users can submit feedback)
@router.post("/feedback")
def submit_feedback(feedback_text: str, rating: int = 5, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    fb = Feedback(user_id=current_user.id, feedback_text=feedback_text, rating=rating)
    db.add(fb)
    db.commit()
    return {"message": "Thank you for your feedback!"}
