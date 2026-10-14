"""
Ruang Nalar AI Backend — FastAPI
AI Agent + Firebase Firestore integration
"""
import os
import sys
import logging
import uuid
from dotenv import load_dotenv
from contextlib import asynccontextmanager

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ai import RuangNalarAI
from firebase_connector import FirebaseConnector
from firebase_admin import firestore
try:
    from rag import retriever
except Exception:
    retriever = None

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
        fc.start_polling(interval=15.0)
        log.info("▶️ Firebase polling started (15s interval — anti rate-limit)")
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


# ── Conversation Memory ──
conversations = {}
MAX_CONV_HISTORY = 20  # max message pairs per conversation


# ── Models ──
class AskRequest(BaseModel):
    question: str
    conversation_id: str = ""
    responden_nama: str = ""
    responden_asal: str = ""

class AskResponse(BaseModel):
    answer: str
    model: str
    formatted: bool
    answered_by: str = "ai"
    conversation_id: str = ""


# ── Percakapan Log ──
import json as _json
from datetime import datetime as _dt, timezone as _tz

PERCAKAPAN_LOG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "percakapan.jsonl")

def log_percakapan(conv_id: str, req: AskRequest, answer: str):
    """Simpan setiap Q&A ke Firestore (collection 'percakapan') + file jsonl lokal."""
    entry = {
        "waktu": _dt.now(_tz.utc).isoformat(),
        "conversation_id": conv_id,
        "responden_nama": req.responden_nama.strip(),
        "responden_asal": req.responden_asal.strip(),
        "pertanyaan": req.question.strip(),
        "jawaban": answer,
        "model": AI_MODEL,
    }
    # 1) File lokal (always)
    try:
        os.makedirs(os.path.dirname(PERCAKAPAN_LOG), exist_ok=True)
        with open(PERCAKAPAN_LOG, "a", encoding="utf-8") as f:
            f.write(_json.dumps(entry, ensure_ascii=False) + "\n")
    except Exception as e:
        log.warning(f"⚠️ Gagal tulis file percakapan: {e}")
    # 2) Firestore (best-effort)
    if fc.db:
        try:
            fc.db.collection("percakapan").add({
                **entry,
                "waktu_firestore": firestore.SERVER_TIMESTAMP,
            })
            log.info(f"📝 Percakapan tersimpan: {conv_id[:8]}… ({req.responden_nama or 'anonim'})")
        except Exception as e:
            log.warning(f"⚠️ Gagal simpan ke Firestore: {e}")


# ── Routes ──
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model": AI_MODEL,
        "ai_ready": ai is not None,
        "ai_paused": os.getenv("AI_PAUSED", "").lower() in ("true", "1", "yes"),
        "firebase_ready": fc.db is not None,
        "polling": fc.running,
        "rag_ready": bool(retriever and retriever.is_ready()),
        "rag_chunks": retriever.count() if retriever else 0,
        "stats": fc.get_stats()
    }

@app.get("/api/knowledge")
async def knowledge():
    """RAG index stats."""
    if not retriever:
        return {"ready": False, "chunks": 0}
    return {"ready": retriever.is_ready(), "chunks": retriever.count()}

@app.get("/api/knowledge/search")
async def knowledge_search(q: str = ""):
    """Debug endpoint: show what dalil RAG retrieves for a question."""
    if not q.strip():
        return {"error": "Parameter 'q' required. Contoh: /api/knowledge/search?q=dalil shalat berjamaah"}
    if not retriever or not retriever.is_ready():
        return {"error": "RAG index belum tersedia"}
    rows = retriever.search(q.strip(), k=5)
    return {
        "query": q.strip(),
        "results": [
            {
                "type": r["type"],
                "ref": r["ref"] or f"{r['imam']} {r['nomor']}",
                "distance": round(r["distance"], 4),
            }
            for r in rows
        ],
        "dalil_block": retriever.format_dalil(rows),
    }

@app.post("/api/ask")
async def ask(req: AskRequest):
    if not ai:
        raise HTTPException(503, "AI backend not ready — set OPENROUTER_API_KEY")
    
    question = req.question.strip()
    if not question:
        raise HTTPException(400, "Pertanyaan tidak boleh kosong")
    
    # ── Conversation Management ──
    conv_id = req.conversation_id or str(uuid.uuid4())
    conv = conversations.get(conv_id, {"messages": []})
    
    # Simpan pertanyaan user ke history
    conv["messages"].append({"role": "user", "content": question})
    
    # Trim biar gak kebanyakan
    if len(conv["messages"]) > MAX_CONV_HISTORY:
        conv["messages"] = conv["messages"][-MAX_CONV_HISTORY:]
    
    # History untuk dikirim ke LLM (sebelum pertanyaan terbaru)
    history = conv["messages"][:-1]
    
    log.info(f"[{conv_id[:8]}] Q: {question[:60]}... ({len(history)//2} previous turns)")
    
    try:
        answer = ai.answer(question, history=history)
        
        # Simpan jawaban AI ke history
        conv["messages"].append({"role": "assistant", "content": answer})
        conversations[conv_id] = conv
        
        formatted = ai.verify_format(answer)
        
        # Catat percakapan + identitas responden (sumber riset)
        log_percakapan(conv_id, req, answer)
        
        return {
            "answer": answer,
            "model": AI_MODEL,
            "formatted": formatted,
            "answered_by": "ai",
            "conversation_id": conv_id
        }
    except Exception as e:
        log.error(f"[{conv_id[:8]}] AI Error: {e}")
        conv["messages"] = conv["messages"][:-1]
        if conv["messages"]:
            conversations[conv_id] = conv
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