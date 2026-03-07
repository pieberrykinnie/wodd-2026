from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    groq_api_key: str = ""
    transit_api_key: str = ""

    socrata_base_url: str = "https://data.winnipeg.ca/resource"
    socrata_app_token: str | None = None

    transit_base_url: str = "https://api.winnipegtransit.com/v4"

    cache_ttl_seconds: int = 3600

    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5173",
    ]

    groq_model: str = "llama-3.3-70b-versatile"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
