import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Resolve backend/.env path and override any OS environment variables to prevent mock key hijacking
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
load_dotenv(dotenv_path=env_path, override=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "Startup Navigator API"
    API_V1_STR: str = "/api"
    
    # Database Configuration
    # Defaults to PostgreSQL, can be overridden by env variable DATABASE_URL
    DATABASE_URL: str = "postgresql://postgres:postgrespassword123@localhost:5432/startup_navigator"
    
    # Security Configuration
    SECRET_KEY: str = "supersecretkey_startupnavigator_changeit_12345"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 Days
    
    # AI Configuration (Gemini or OpenAI)
    AI_PROVIDER: str = "gemini"  # 'gemini' or 'openai'
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    
    # Cloudinary Config (Optional, falls back to local or memory mock)
    CLOUDINARY_URL: str = ""
    
    class Config:
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
        case_sensitive = True

settings = Settings()
