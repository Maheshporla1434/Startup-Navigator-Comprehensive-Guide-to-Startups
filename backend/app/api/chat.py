import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app.models import AIChat, ChatMessage, SearchHistory
from backend.app.schemas import AIChatResponse, ChatRequest, ChatMessageResponse, SearchHistoryResponse
from backend.app.api.auth import get_current_user
from backend.app.services.rag_service import retrieve_relevant_contexts, generate_grounded_answer

router = APIRouter()

# Get chat sessions list
@router.get("/sessions", response_model=List[AIChatResponse])
def get_chat_sessions(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(AIChat).filter(AIChat.user_id == current_user.id).order_by(AIChat.created_at.desc()).all()

# Delete chat session
@router.delete("/sessions/{id}")
def delete_chat_session(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    chat = db.query(AIChat).filter(AIChat.id == id, AIChat.user_id == current_user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat session not found")
    db.delete(chat)
    db.commit()
    return {"message": "Chat session deleted"}

# Get single chat session history
@router.get("/sessions/{id}", response_model=AIChatResponse)
def get_chat_session(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    chat = db.query(AIChat).filter(AIChat.id == id, AIChat.user_id == current_user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return chat

# Execute a chat message (AI Search / RAG)
@router.post("", response_model=ChatMessageResponse)
def chat_message(chat_req: ChatRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # 1. Retrieve or create the chat session
    chat_id = chat_req.chat_id
    if not chat_id:
        chat = AIChat(
            user_id=current_user.id,
            title=chat_req.message[:40] + ("..." if len(chat_req.message) > 40 else "")
        )
        db.add(chat)
        db.commit()
        db.refresh(chat)
        chat_id = chat.id
    else:
        chat = db.query(AIChat).filter(AIChat.id == chat_id, AIChat.user_id == current_user.id).first()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat session not found")

    # 2. Add user message to DB
    user_msg = ChatMessage(
        chat_id=chat_id,
        role="user",
        content=chat_req.message
    )
    db.add(user_msg)
    db.commit()

    # 3. Retrieve relevant context (RAG)
    contexts = retrieve_relevant_contexts(db, query=chat_req.message, top_k=5)
    
    # 4. Generate grounded answer via LLM/Fallback
    answer_text, citations = generate_grounded_answer(chat_req.message, contexts)
    citations_json = json.dumps(citations) if citations else "[]"
    
    # 5. Add assistant message to DB
    assistant_msg = ChatMessage(
        chat_id=chat_id,
        role="assistant",
        content=answer_text,
        citations=citations_json
    )
    db.add(assistant_msg)
    
    # 6. Save query to general search history
    history_item = SearchHistory(
        user_id=current_user.id,
        question=chat_req.message,
        answer=answer_text
    )
    db.add(history_item)
    
    db.commit()
    db.refresh(assistant_msg)
    return assistant_msg

# Get search history items
@router.get("/history", response_model=List[SearchHistoryResponse])
def get_search_history(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(SearchHistory).filter(SearchHistory.user_id == current_user.id).order_by(SearchHistory.created_at.desc()).all()

# Delete search history item
@router.delete("/history/{id}")
def delete_search_history_item(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    history_item = db.query(SearchHistory).filter(SearchHistory.id == id, SearchHistory.user_id == current_user.id).first()
    if not history_item:
        raise HTTPException(status_code=404, detail="History item not found")
    db.delete(history_item)
    db.commit()
    return {"message": "History item deleted"}
