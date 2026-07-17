from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.models import Bookmark
from backend.app.schemas import BookmarkResponse, BookmarkCreate
from backend.app.api.auth import get_current_user

router = APIRouter()

@router.get("", response_model=List[BookmarkResponse])
def get_bookmarks(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Bookmark).filter(Bookmark.user_id == current_user.id).all()

@router.post("", response_model=BookmarkResponse)
def add_bookmark(bookmark_in: BookmarkCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Check if duplicate exists
    query = db.query(Bookmark).filter(Bookmark.user_id == current_user.id)
    if bookmark_in.article_id:
        query = query.filter(Bookmark.article_id == bookmark_in.article_id)
    elif bookmark_in.resource_id:
        query = query.filter(Bookmark.resource_id == bookmark_in.resource_id)
    elif bookmark_in.chat_id:
        query = query.filter(Bookmark.chat_id == bookmark_in.chat_id)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide article_id, resource_id, or chat_id"
        )
        
    existing = query.first()
    if existing:
        return existing
        
    new_bookmark = Bookmark(
        user_id=current_user.id,
        article_id=bookmark_in.article_id,
        resource_id=bookmark_in.resource_id,
        chat_id=bookmark_in.chat_id
    )
    db.add(new_bookmark)
    db.commit()
    db.refresh(new_bookmark)
    return new_bookmark

@router.delete("/{id}")
def delete_bookmark(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    bookmark = db.query(Bookmark).filter(Bookmark.id == id, Bookmark.user_id == current_user.id).first()
    if not bookmark:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bookmark not found"
        )
    db.delete(bookmark)
    db.commit()
    return {"message": "Bookmark removed"}

@router.delete("/toggle/{item_type}/{item_id}")
def toggle_bookmark(item_type: str, item_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    query = db.query(Bookmark).filter(Bookmark.user_id == current_user.id)
    if item_type == "article":
        query = query.filter(Bookmark.article_id == item_id)
    elif item_type == "resource":
        query = query.filter(Bookmark.resource_id == item_id)
    elif item_type == "chat":
        query = query.filter(Bookmark.chat_id == item_id)
    else:
        raise HTTPException(status_code=400, detail="Invalid item type")
        
    existing = query.first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"bookmarked": False}
    else:
        new_bookmark = Bookmark(user_id=current_user.id)
        if item_type == "article":
            new_bookmark.article_id = item_id
        elif item_type == "resource":
            new_bookmark.resource_id = item_id
        elif item_type == "chat":
            new_bookmark.chat_id = item_id
        db.add(new_bookmark)
        db.commit()
        return {"bookmarked": True}
