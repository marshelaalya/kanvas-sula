from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://stativa_user:stativa_secret_2026@localhost:5432/stativa"

    # Security
    secret_key: str = "dev-secret-key"

    # File uploads
    upload_dir: str = "./uploads"
    max_file_size_mb: int = 20

    # CORS
    allowed_origins: str = "http://localhost:3000"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
