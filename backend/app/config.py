"""应用配置：从 backend/.env 读取环境变量。"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_ENV_FILE, env_file_encoding="utf-8", extra="ignore"
    )

    dashscope_api_key: str = ""
    base_url: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    model_name: str = "qwen3.7-max"
    tavily_api_key: str = ""

    search_max_results: int = 8


@lru_cache
def get_settings() -> Settings:
    return Settings()
