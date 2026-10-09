"""
Ruang Nalar Telegram Bot — Training & Question Answering
"""
import os
import json
import httpx
import logging
from datetime import datetime, timezone
from dotenv import load_dotenv

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application, CommandHandler, MessageHandler, filters,
    CallbackQueryHandler, ContextTypes
)

load_dotenv()

# ── Config ──
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
AI_API_URL = os.getenv("AI_API_URL", "http://localhost:8080/api/ask")
ADMIN_USER_IDS = [int(x) for x in os.getenv("ADMIN_USER_IDS", "").split(",") if x.strip()]

# ── Logging ──
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s"
)
log = logging.getLogger("ruangnalar.bot")

# ── AI call ──
async def call_ai(question: str) -> dict:
    """Send question to Ruang Nalar AI backend."""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                AI_API_URL,
                json={"question": question},
                headers={"Content-Type": "application/json"}
            )
            resp.raise_for_status()
            return resp.json()
    except httpx.ConnectError:
        return {"error": "⚠️ AI backend sedang offline. Coba lagi nanti."}
    except Exception as e:
        return {"error": f"⚠️ Gagal: {str(e)[:150]}"}


def is_admin(user_id: int) -> bool:
    """Check if user is authorized admin."""
    if not ADMIN_USER_IDS:
        # If no admin list, everyone is admin (development mode)
        return True
    return user_id in ADMIN_USER_IDS


# ── Commands ──

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Welcome message."""
    await update.message.reply_text(
        "🌙 **Selamat datang! Saya 'Aqli'**\n\n"
        "Aku adalah AI Ruang Nalar yang siap menjawab pertanyaanmu seputar "
        "nalar, filsafat, dan perspektif Islam.\n\n"
        "**Cara pakai:**\n"
        "• Ketik `?` diikuti pertanyaan — contoh:\n"
        "  `?Mengapa manusia diberikan akal?`\n"
        "  `?Apa itu takdir dalam Islam?`\n\n"
        "• Atau kirim `/ask <pertanyaan>`\n\n"
        f"• Ketik `/help` untuk bantuan"
    )


async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Show help."""
    text = (
        "📖 **Ruang Nalar AI — Bantuan**\n\n"
        "**Cara bertanya:**\n"
        "• `?pertanyaan` — format tercepat\n"
        "• `/ask pertanyaan` — format alternatif\n"
        "• Langsung kirim teks biasa\n\n"
        "**Admin commands:**\n" if is_admin(update.effective_user.id) else ""
    )
    
    if is_admin(update.effective_user.id):
        text += (
        "• `/stats` — statistik bot & backend\n"
        "• `/train tambah <pengetahuan>` — tambah pengetahuan\n"
        "• `/health` — cek status backend\n"
        )
    
    await update.message.reply_text(text)


async def ask(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Answer a question via AI backend."""
    question = " ".join(context.args) if context.args else ""
    
    if not question:
        await update.message.reply_text(
            "Gunakan:\n`/ask <pertanyaan>`\n"
            "Contoh: `/ask Mengapa manusia berakal?`"
        )
        return
    
    await process_question(update, question)


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle text messages — detect ? prefix or treat as question."""
    text = update.message.text.strip()
    
    # Skip commands and empty
    if text.startswith("/") or not text:
        return
    
    # If starts with ?, treat as question
    if text.startswith("?"):
        question = text[1:].strip()
        if question:
            await process_question(update, question)
        return
    
    # Otherwise, don't auto-answer plain messages to avoid noise
    # Only answer if it looks like a question
    question_words = ["apa", "siapa", "kenapa", "mengapa", "bagaimana", "kapan", "dimana", 
                      "what", "why", "how", "when", "where", "which", "who",
                      "apakah", "adakah", "bisakah", "haruskah"]
    
    first_word = text.lower().split()[0] if text.split() else ""
    ends_with_q = text.rstrip().endswith("?")
    
    if first_word in question_words or ends_with_q or len(text) > 20:
        await process_question(update, text)
    else:
        # Short non-question — just ignore
        pass


async def process_question(update: Update, question: str):
    """Process a question: show typing → call AI → send answer."""
    msg = await update.message.reply_text("🧠 _Ruang Nalar sedang berpikir..._")
    
    answer = await call_ai(question)
    
    if "error" in answer:
        await msg.edit_text(answer["error"])
        return
    
    # Format response
    ai_text = answer.get("answer", "Maaf, tidak ada jawaban.")
    
    # Telegram has 4096 char limit — split if too long
    if len(ai_text) <= 4000:
        await msg.edit_text(ai_text)
    else:
        # Split by sections
        await msg.edit_text(ai_text[:4000] + "\n\n_— bersambung ke pesan berikut —_")
        remaining = ai_text[4000:]
        while remaining:
            await update.message.reply_text(remaining[:4000])
            remaining = remaining[4000:]


# ── Admin Commands ──

async def stats_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Show bot & backend stats (admin only)."""
    if not is_admin(update.effective_user.id):
        await update.message.reply_text("❌ Command ini hanya untuk admin.")
        return
    
    # Get backend health
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get("http://localhost:8080/health")
            health = resp.json()
            stats_text = (
                f"📊 **Backend Stats**\n\n"
                f"AI Ready: {'✅' if health.get('ai_ready') else '❌'}\n"
                f"Firebase: {'✅' if health.get('firebase_ready') else '❌'}\n"
                f"Polling: {'✅' if health.get('polling') else '❌'}\n"
                f"Model: `{health.get('model', '?')}`\n"
                f"Answered: {health.get('stats', {}).get('answered', 0)}\n"
                f"Errors: {health.get('stats', {}).get('errors', 0)}"
            )
    except Exception as e:
        stats_text = f"⚠️ Backend unreachable: {e}"
    
    await update.message.reply_text(stats_text)


async def health_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Check backend health."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get("http://localhost:8080/health")
            status = resp.json()
            await update.message.reply_text(
                f"🏥 **Backend Health**\n\n"
                f"Status: `{status.get('status')}`\n"
                f"AI: {'✅' if status.get('ai_ready') else '❌'}\n"
                f"Firebase: {'✅' if status.get('firebase_ready') else '❌'}"
            )
    except Exception as e:
        await update.message.reply_text(f"⚠️ Backend unreachable: {e}")


# ── Error Handler ──

async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Log errors."""
    log.error(f"Update {update} caused error {context.error}")


# ── Main ──

def main():
    if not BOT_TOKEN:
        log.error("TELEGRAM_BOT_TOKEN not set!")
        return
    
    app = Application.builder().token(BOT_TOKEN).build()
    
    # Commands
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_cmd))
    app.add_handler(CommandHandler("ask", ask))
    app.add_handler(CommandHandler("health", health_cmd))
    app.add_handler(CommandHandler("stats", stats_cmd))
    
    # Text messages (handle questions)
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    # Errors
    app.add_error_handler(error_handler)
    
    log.info("🤖 Ruang Nalar Bot starting...")
    app.run_polling()


if __name__ == "__main__":
    main()