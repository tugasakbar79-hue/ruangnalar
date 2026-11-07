
"""
Ruang Nalar AI Backend — FastAPI
AI Agent + Firebase Firestore integration
"""

import os
import sys
import logging
import uuid
from contextlib import asynccontextmanager

# ==================================================
# PATH CONFIGURATION
# ==================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# ==================================================
# ENVIRONMENT
# ==================================================

from dotenv import load_dotenv

load_dotenv(os.path.join(BASE_DIR, ".env"))

# ==================================================
# FASTAPI IMPORTS
# ==================================================

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ==================================================
# LOCAL MODULES
# ==================================================

from ai import RuangNalarAI
from firebase_connector import FirebaseConnector
from firebase_admin import firestore

try:
    from rag import retriever
except Exception as e:
    logging.warning(f"RAG tidak tersedia: {e}")
    retriever = None


# ==================================================
# LOGGING
# ==================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)


# ==================================================
# LIFESPAN
# ==================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Ruang Nalar Backend starting...")

    try:
        app.state.firebase = FirebaseConnector()
        logger.info("Firebase initialized")
    except Exception as e:
        logger.exception("Firebase initialization failed")
        app.state.firebase = None

    try:
        app.state.ai = RuangNalarAI()
        logger.info("AI initialized")
    except Exception as e:
        logger.exception("AI initialization failed")
        app.state.ai = None

    yield

    logger.info("Ruang Nalar Backend shutting down")


# ==================================================
# APP
# ==================================================

app = FastAPI(
    title="Ruang Nalar AI API",
    description="Backend AI untuk platform Ruang Nalar",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ==================================================
# REQUEST MODEL
# ==================================================

class AskRequest(BaseModel):
    question: str
    session_id: str | None = None


# ==================================================
# HEALTH CHECK
# ==================================================

@app.get("/health")
async def health():
    return {
        "status": "online",
        "message": "Ruang Nalar API berjalan"
    }


# ==================================================
# KNOWLEDGE
# ==================================================

@app.get("/api/knowledge")
async def get_knowledge():
    if retriever is None:
        return {
            "status": "unavailable",
            "data": []
        }

    try:
        return {
            "status": "success",
            "data": retriever.get_all()
        }
    except Exception as e:
        logger.exception("Knowledge error")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/knowledge/search")
async def search_knowledge(q: str):
    if retriever is None:
        return {
            "status": "unavailable",
            "data": []
        }

    try:
        results = retriever.search(q)

        return {
            "status": "success",
            "data": results
        }
    except Exception as e:
        logger.exception("Knowledge search error")
        raise HTTPException(status_code=500, detail=str(e))


# ==================================================
# ASK AI
# ==================================================

@app.post("/api/ask")
async def ask_ai(request: AskRequest):
    if not request.question.strip():
        raise HTTPException(
            status_code=400,
            detail="Pertanyaan tidak boleh kosong"
        )

    ai = getattr(app.state, "ai", None)

    if ai is None:
        raise HTTPException(
            status_code=503,
            detail="Layanan AI belum tersedia"
        )

    try:
        answer = ai.ask(request.question)

        return {
            "status": "success",
            "question": request.question,
            "answer": answer,
            "session_id": request.session_id or str(uuid.uuid4())
        }

    except Exception as e:
        logger.exception("AI request failed")
        raise HTTPException(
            status_code=500,
            detail="Terjadi kesalahan saat memproses pertanyaan"
        )


# ==================================================
# STATISTICS
# ==================================================

@app.get("/api/stats")
async def get_stats():
    firebase = getattr(app.state, "firebase", None)

    if firebase is None:
        return {
            "status": "unavailable",
            "total": 0
        }

    try:
        return {
            "status": "success",
            "total": 0
        }
    except Exception:
        logger.exception("Statistics error")
        raise HTTPException(
            status_code=500,
            detail="Gagal mengambil statistik"
        )
