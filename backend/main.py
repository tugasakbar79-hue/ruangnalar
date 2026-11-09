
"""
Ruang Nalar AI Backend — FastAPI
AI Agent + Firebase Firestore integration
"""

import os
import sys
import uuid
import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from starlette.concurrency import run_in_threadpool

# ==================================================
# PATH CONFIGURATION
# ==================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)

if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# ==================================================
# ENVIRONMENT
# ==================================================

load_dotenv(os.path.join(PROJECT_DIR, ".env"))
load_dotenv(os.path.join(BASE_DIR, ".env"), override=False)

# ==================================================
# LOCAL AI MODULE
# ==================================================

from ai import RuangNalarAI

# ==================================================
# OPTIONAL RAG
# ==================================================

try:
    from rag import retriever
except Exception as e:
    logging.warning("RAG tidak tersedia: %s", e)
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

    app.state.ai = None
    app.state.firebase = None

    # Inisialisasi AI secara terpisah
    try:
        app.state.ai = RuangNalarAI()
        logger.info("AI initialized successfully")

    except Exception:
        logger.exception("AI initialization failed")

    # Firebase bersifat opsional untuk layanan AI
    try:
        from firebase_connector import FirebaseConnector

        app.state.firebase = FirebaseConnector()
        logger.info("Firebase initialized successfully")

    except Exception:
        logger.exception("Firebase initialization failed")

    yield

    logger.info("Ruang Nalar Backend shutting down")

# ==================================================
# APP
# ==================================================

app = FastAPI(
    title="Ruang Nalar AI API",
    description="Backend AI untuk pembelajaran akhlak",
    version="1.1.0",
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
    conversation_id: str | None = None
    history: list[dict] | None = None

# ==================================================
# HEALTH CHECK
# ==================================================

@app.get("/health")
async def health():

    ai_ready = getattr(app.state, "ai", None) is not None
    firebase_ready = getattr(app.state, "firebase", None) is not None

    return {
        "status": "online",
        "message": "Ruang Nalar API berjalan",
        "ai": "ready" if ai_ready else "unavailable",
        "firebase": "ready" if firebase_ready else "unavailable"
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

    except Exception:
        logger.exception("Knowledge error")
        raise HTTPException(
            status_code=500,
            detail="Gagal mengambil data pengetahuan"
        )

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

    except Exception:
        logger.exception("Knowledge search error")
        raise HTTPException(
            status_code=500,
            detail="Gagal mencari pengetahuan"
        )

# ==================================================
# ASK AI
# ==================================================

@app.post("/api/ask")
async def ask_ai(request: AskRequest):

    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Pertanyaan tidak boleh kosong"
        )

    if len(question) > 10000:
        raise HTTPException(
            status_code=400,
            detail="Pertanyaan terlalu panjang"
        )

    ai = getattr(app.state, "ai", None)

    if ai is None:
        raise HTTPException(
            status_code=503,
            detail="Layanan AI belum tersedia. Periksa konfigurasi API."
        )

    session_id = (
        request.session_id
        or request.conversation_id
        or str(uuid.uuid4())
    )

    try:
        answer = await run_in_threadpool(
            ai.answer,
            question,
            history=request.history
        )

        if not isinstance(answer, str) or not answer.strip():
            raise RuntimeError("AI mengembalikan jawaban kosong")

        return {
            "status": "success",
            "question": question,
            "answer": answer.strip(),
            "session_id": session_id,
            "conversation_id": session_id
        }

    except Exception:
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

    return {
        "status": "success",
        "total": 0
    }
