"""
Ruang Nalar AI Backend — FastAPI
AI Agent + Firebase Firestore integration
"""
import os
import sys
import logging
from dotenv import load_dotenv
from contextlib import asynccontextmanager

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ai import RuangNalarAI
from firebase_connector import FirebaseConnector

# ── Logging ──
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s"
)
log = logging.getLogger("ruangnalar")

# ── Init AI ──
AI_KEY = os.getenv("OPENROUTER_API_KEY")
AI_MODEL = os.getenv("AI_MODEL", "deepseek/deepseek-v4-flash")

ai = None
if AI_KEY:
    try:
        ai = RuangNalarAI(api_key=AI_KEY, model=AI_MODEL)
        log.info(f"🧠 AI ready: {AI_MODEL}")
    except Exception as e:
        log.warning(f"⚠️ AI init failed: {e}")
else:
    log.warning("⚠️ OPENROUTER_API_KEY belum diset. AI mode nonaktif.")

# ── Init Firebase ──
fc = FirebaseConnector(ai_instance=ai)
if fc.db:
    log.info(f"🔥 Firebase connected: {fc.db is not None}")


# ── App lifecycle ──
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start polling on startup, stop on shutdown."""
    # Startup
    if fc.is_ready():
        fc.start_polling(interval=3.0)
        log.info("▶️ Firebase polling started (3s interval)")
    else:
        log.warning("⏸️ Firebase polling not started — AI or DB not ready")
    yield
    # Shutdown
    fc.stop_polling()
    log.info("⏹️ Firebase polling stopped")


app = FastAPI(
    title="Ruang Nalar AI",
    description="AI Agent untuk menjawab pertanyaan nalar & teologi Islam",
    version="1.1.0",
    lifespan=lifespan
)

# CORS — allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Models ──
class AskRequest(BaseModel):
    question: str

class AskResponse(BaseModel):
    answer: str
    model: str
    formatted: bool
    answered_by: str = "ai"


# ── Routes ──
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model": AI_MODEL,
        "ai_ready": ai is not None,
        "firebase_ready": fc.db is not None,
        "polling": fc.running,
        "stats": fc.get_stats()
    }

@app.post("/api/ask", response_model=AskResponse)
async def ask(req: AskRequest):
    if not ai:
        raise HTTPException(503, "AI backend not ready — set OPENROUTER_API_KEY")
    
    question = req.question.strip()
    if not question:
        raise HTTPException(400, "Pertanyaan tidak boleh kosong")
    
    log.info(f"Q: {question[:80]}...")
    
    try:
        answer = ai.answer(question)
        formatted = ai.verify_format(answer)
        
        return AskResponse(
            answer=answer,
            model=AI_MODEL,
            formatted=formatted
        )
    except Exception as e:
        log.error(f"AI Error: {e}")
        raise HTTPException(500, f"Gagal: {str(e)[:200]}")

@app.get("/api/ask")
async def ask_get(q: str = ""):
    """GET endpoint for quick testing."""
    if not q.strip():
        return {"error": "Parameter 'q' required. Contoh: /api/ask?q=Mengapa manusia berakal?"}
    if not ai:
        raise HTTPException(503, "AI not ready")
    
    try:
        answer = ai.answer(q.strip())
        return {
            "question": q.strip(),
            "answer": answer,
            "model": AI_MODEL,
            "formatted": ai.verify_format(answer)
        }
    except Exception as e:
        raise HTTPException(500, str(e)[:200])

@app.get("/api/stats")
async def stats():
    """Get backend statistics."""
    return fc.get_stats()


# ── Run ──
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8080"))
    host = os.getenv("HOST", "0.0.0.0")
    
    log.info(f"🚀 Ruang Nalar AI starting on {host}:{port}")
    uvicorn.run("main:app", host=host, port=port)