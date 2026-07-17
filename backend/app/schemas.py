from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True

# Article Schemas
class ArticleBase(BaseModel):
    title: str
    slug: str
    content: str
    summary: Optional[str] = None
    category_id: int
    difficulty: str = "beginner"
    reading_time: int = 5
    is_draft: bool = False

class ArticleCreate(ArticleBase):
    pass

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    category_id: Optional[int] = None
    difficulty: Optional[str] = None
    reading_time: Optional[int] = None
    is_draft: Optional[bool] = None

class ArticleResponse(ArticleBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True

# Resource Schemas
class ResourceBase(BaseModel):
    title: str
    url: str
    description: Optional[str] = None
    type: str

class ResourceCreate(ResourceBase):
    pass

class ResourceResponse(ResourceBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Bookmark Schemas
class BookmarkCreate(BaseModel):
    article_id: Optional[int] = None
    resource_id: Optional[int] = None
    chat_id: Optional[int] = None

class BookmarkResponse(BaseModel):
    id: int
    user_id: int
    article_id: Optional[int] = None
    resource_id: Optional[int] = None
    chat_id: Optional[int] = None
    created_at: datetime.datetime
    article: Optional[ArticleResponse] = None
    resource: Optional[ResourceResponse] = None

    class Config:
        from_attributes = True

# Search History Schemas
class SearchHistoryResponse(BaseModel):
    id: int
    user_id: int
    question: str
    answer: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Chat Schemas
class ChatMessageResponse(BaseModel):
    id: int
    chat_id: int
    role: str
    content: str
    citations: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class AIChatResponse(BaseModel):
    id: int
    user_id: int
    title: str
    created_at: datetime.datetime
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    chat_id: Optional[int] = None
    message: str

# Feedback Schemas
class FeedbackCreate(BaseModel):
    feedback_text: str
    rating: int = Field(5, ge=1, le=5)

class FeedbackResponse(FeedbackCreate):
    id: int
    user_id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Dashboard Stats Schemas
class DashboardStats(BaseModel):
    total_articles: int
    total_resources: int
    total_users: int
    total_searches: int
    total_bookmarks: int
    recent_activity: List[str]
