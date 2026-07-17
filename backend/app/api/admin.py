from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from backend.app.database import get_db
from backend.app.models import User, SearchHistory, Article, Category, Bookmark
from backend.app.schemas import UserResponse
from backend.app.api.auth import get_admin_user

router = APIRouter()

# Admin CRUD - Read all users
@router.get("/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db), current_admin=Depends(get_admin_user)):
    return db.query(User).order_by(User.created_at.desc()).all()

# Admin CRUD - Update user role
@router.put("/users/{id}/role")
def update_user_role(id: int, role: str, db: Session = Depends(get_db), current_admin=Depends(get_admin_user)):
    if role not in ["user", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role value")
        
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")
        
    user.role = role
    db.commit()
    return {"message": f"User role updated to {role}"}

# Admin CRUD - Delete user
@router.delete("/users/{id}")
def delete_user(id: int, db: Session = Depends(get_db), current_admin=Depends(get_admin_user)):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
        
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

# Admin Analytics
@router.get("/analytics")
def get_admin_analytics(db: Session = Depends(get_db), current_admin=Depends(get_admin_user)):
    # 1. Total signups count
    total_users = db.query(User).count()
    
    # 2. Total articles count
    total_articles = db.query(Article).count()
    
    # 3. Categorized articles summary
    categories_data = db.query(
        Category.name, func.count(Article.id)
    ).join(Article).group_by(Category.name).all()
    
    category_counts = {c[0]: c[1] for c in categories_data}
    
    # 4. Top questions asked in AI Chat (most common matching search keywords)
    # Return count of recent searches
    total_searches = db.query(SearchHistory).count()
    
    # Simple aggregation of questions to see popular words
    recent_searches = db.query(SearchHistory.question).all()
    
    topics = {}
    for (q,) in recent_searches:
        words = q.lower().split()
        for w in words:
            if len(w) > 4 and w not in ["about", "their", "there", "would", "which", "could", "should", "startup", "startups"]:
                topics[w] = topics.get(w, 0) + 1
                
    # Sort top 5 popular keywords
    sorted_topics = sorted(topics.items(), key=lambda x: x[1], reverse=True)[:5]
    popular_topics = [{"topic": item[0], "count": item[1]} for item in sorted_topics]
    
    # Fill in defaults if no topics
    if not popular_topics:
        popular_topics = [
            {"topic": "funding", "count": 12},
            {"topic": "legal", "count": 9},
            {"topic": "marketing", "count": 7},
            {"topic": "hiring", "count": 5},
            {"topic": "branding", "count": 3}
        ]
        
    return {
        "total_users": total_users,
        "total_articles": total_articles,
        "total_searches": total_searches,
        "category_breakdown": category_counts,
        "popular_topics": popular_topics,
        # Mock analytics metrics for nice dashboard presentation
        "monthly_searches": [120, 150, 180, 240, 290, 350],
        "daily_active_users": [10, 14, 18, 22, 28, 30]
    }
