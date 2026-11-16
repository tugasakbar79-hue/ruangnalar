
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")


class Settings:
    APP_NAME = "AQLI AI - Ruang Nalar Akhlak"
    APP_VERSION = "2.0.0"

    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openrouter")

    OLLAMA_BASE_URL = os.getenv(
        "OLLAMA_BASE_URL",
        "http://localhost:11434"
    )

    OLLAMA_MODEL = os.getenv(
        "OLLAMA_MODEL",
        "qwen2.5:3b"
    )

    OPENROUTER_API_KEY = os.getenv(
        "OPENROUTER_API_KEY",
        ""
    )

    OPENROUTER_MODEL = os.getenv(
        "OPENROUTER_MODEL",
        "deepseek/deepseek-v4-flash"
    )

    FRONTEND_ORIGINS = [
        origin.strip()
        for origin in os.getenv(
            "FRONTEND_ORIGINS",
            "http://localhost:5500,https://ruangnalar-tau.vercel.app"
        ).split(",")
        if origin.strip()
    ]


settings = Settings()
