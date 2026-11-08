
"""
Ruang Nalar Akhlak Telegram Bot
Training & Question Answering
"""

import os
import logging
import httpx

from dotenv import load_dotenv
from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    filters,
    ContextTypes
)

load_dotenv()


# ==========================================
# CONFIGURATION
# ==========================================

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

AI_API_URL = os.getenv(
    "AI_API_URL",
    "http://localhost:8080/api/ask"
)

BACKEND_HEALTH_URL = os.getenv(
    "BACKEND_HEALTH_URL",
    AI_API_URL.rsplit("/", 1)[0] + "/health"
)

ADMIN_USER_IDS = [
    int(x.strip())
    for x in os.getenv("ADMIN_USER_IDS", "").split(",")
    if x.strip().isdigit()
]


# ==========================================
# LOGGING
# ==========================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s"
)

log = logging.getLogger("ruangnalar.akhlak.bot")


# ==========================================
# AI BACKEND
# ==========================================

async def call_ai(question: str) -> dict:
    """Mengirim pertanyaan ke backend Ruang Nalar Akhlak."""

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:

            response = await client.post(
                AI_API_URL,
                json={
                    "question": question,
                    "history": []
                },
                headers={
                    "Content-Type": "application/json"
                }
            )

            response.raise_for_status()

            data = response.json()

            if not isinstance(data, dict):
                return {
                    "error": "Backend memberikan format jawaban tidak valid."
                }

            return data

    except httpx.ConnectError:
        return {
            "error": (
                "⚠️ Backend Ruang Nalar Akhlak sedang tidak dapat "
                "dihubungi. Silakan coba lagi nanti."
            )
        }

    except httpx.TimeoutException:
        return {
            "error": "⏳ AI membutuhkan waktu terlalu lama. Coba lagi."
        }

    except httpx.HTTPStatusError as e:
        log.error(
            "Backend HTTP error: %s %s",
            e.response.status_code,
            e.response.text[:300]
        )

        return {
            "error": (
                f"⚠️ Backend mengalami kesalahan "
                f"(HTTP {e.response.status_code})."
            )
        }

    except Exception as e:
        log.exception("AI request failed")

        return {
            "error": f"⚠️ Gagal memproses pertanyaan: {str(e)[:150]}"
        }


# ==========================================
# ADMIN
# ==========================================

def is_admin(user_id: int) -> bool:
    """Memeriksa hak akses admin."""

    return user_id in ADMIN_USER_IDS


# ==========================================
# START COMMAND
# ==========================================

async def start(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    welcome = (
        "🌱 **Selamat datang di Ruang Nalar Akhlak!**\n\n"
        "Saya adalah **Aqli**, asisten AI yang membantu kamu "
        "memahami dan menerapkan akhlak dalam kehidupan sehari-hari.\n\n"

        "📚 **Apa yang bisa kamu diskusikan?**\n"
        "• Kejujuran dan integritas\n"
        "• Tanggung jawab dan amanah\n"
        "• Disiplin dan menghargai waktu\n"
        "• Sopan santun dan menghormati orang lain\n"
        "• Kepedulian dan tolong-menolong\n"
        "• Akhlak dalam pergaulan dan dunia digital\n\n"

        "💬 **Cara bertanya:**\n"
        "Ketik `?` diikuti pertanyaan.\n"
        "Contoh: `?Mengapa kita harus jujur?`\n\n"

        "Atau gunakan:\n"
        "`/ask Mengapa tanggung jawab itu penting?`\n\n"

        "Ketik `/help` untuk melihat panduan."
    )

    await update.message.reply_text(
        welcome,
        parse_mode="Markdown"
    )


# ==========================================
# HELP COMMAND
# ==========================================

async def help_cmd(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    help_text = (
        "📖 **RUANG NALAR AKHLAK — BANTUAN**\n\n"

        "**Cara menggunakan:**\n"
        "• `?pertanyaan` — bertanya dengan cepat\n"
        "• `/ask pertanyaan` — mengirim pertanyaan\n\n"

        "**Contoh pertanyaan:**\n"
        "• Mengapa kejujuran penting bagi pelajar?\n"
        "• Bagaimana menerapkan disiplin di sekolah?\n"
        "• Apa yang harus dilakukan ketika berbuat salah?\n"
        "• Bagaimana menghormati pendapat teman?\n\n"

        "**Perintah umum:**\n"
        "• `/start` — mulai menggunakan bot\n"
        "• `/help` — panduan penggunaan\n"
    )

    if is_admin(update.effective_user.id):
        help_text += (
            "\n**Perintah admin:**\n"
            "• `/health` — memeriksa backend\n"
            "• `/stats` — melihat statistik backend\n"
        )

    await update.message.reply_text(
        help_text,
        parse_mode="Markdown"
    )


# ==========================================
# ASK COMMAND
# ==========================================

async def ask(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    question = " ".join(context.args).strip()

    if not question:
        await update.message.reply_text(
            "Gunakan format:\n"
            "`/ask <pertanyaan>`\n\n"
            "Contoh:\n"
            "`/ask Mengapa kita harus bertanggung jawab?`",
            parse_mode="Markdown"
        )
        return

    await process_question(update, question)


# ==========================================
# MESSAGE HANDLER
# ==========================================

async def handle_message(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    if not update.message or not update.message.text:
        return

    text = update.message.text.strip()

    if not text or text.startswith("/"):
        return

    # Format pertanyaan dengan tanda ?
    if text.startswith("?"):

        question = text[1:].strip()

        if question:
            await process_question(update, question)

        return

    # Deteksi pesan yang terlihat seperti pertanyaan
    question_words = [
        "apa",
        "siapa",
        "kenapa",
        "mengapa",
        "bagaimana",
        "kapan",
        "dimana",
        "apakah",
        "adakah",
        "bisakah",
        "haruskah",
        "mengapa",
        "bagaimanakah"
    ]

    first_word = text.lower().split()[0]

    if (
        first_word in question_words
        or text.endswith("?")
    ):
        await process_question(update, text)


# ==========================================
# PROCESS QUESTION
# ==========================================

async def process_question(
    update: Update,
    question: str
):

    if len(question) > 10000:
        await update.message.reply_text(
            "Pertanyaan terlalu panjang. Silakan ringkas pertanyaanmu."
        )
        return

    message = await update.message.reply_text(
        "🧠 Aqli sedang memahami pertanyaanmu..."
    )

    result = await call_ai(question)

    if "error" in result:
        await message.edit_text(result["error"])
        return

    ai_text = result.get("answer")

    if not isinstance(ai_text, str) or not ai_text.strip():
        await message.edit_text(
            "Maaf, Aqli belum berhasil menghasilkan jawaban. "
            "Silakan coba kembali."
        )
        return

    # Telegram membatasi pesan sekitar 4096 karakter.
    # Pecah berdasarkan batas aman.
    chunks = [
        ai_text[i:i + 3900]
        for i in range(0, len(ai_text), 3900)
    ]

    await message.edit_text(chunks[0])

    for chunk in chunks[1:]:
        await update.message.reply_text(chunk)


# ==========================================
# BACKEND HEALTH
# ==========================================

async def health_cmd(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    if not is_admin(update.effective_user.id):
        await update.message.reply_text(
            "❌ Perintah ini hanya dapat digunakan oleh admin."
        )
        return

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:

            response = await client.get(BACKEND_HEALTH_URL)
            response.raise_for_status()

            status = response.json()

        text = (
            "🏥 **RUANG NALAR AKHLAK — BACKEND HEALTH**\n\n"
            f"Status: `{status.get('status', 'unknown')}`\n"
            f"AI: {'✅' if status.get('ai_ready') else '❌'}\n"
            f"Firebase: "
            f"{'✅' if status.get('firebase_ready') else '❌'}\n"
            f"Model: `{status.get('model', 'unknown')}`"
        )

    except Exception as e:
        log.exception("Health check failed")

        text = (
            "⚠️ Backend tidak dapat dihubungi.\n"
            f"Detail: {str(e)[:200]}"
        )

    await update.message.reply_text(
        text,
        parse_mode="Markdown"
    )


# ==========================================
# STATS COMMAND
# ==========================================

async def stats_cmd(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    if not is_admin(update.effective_user.id):
        await update.message.reply_text(
            "❌ Perintah ini hanya dapat digunakan oleh admin."
        )
        return

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:

            response = await client.get(BACKEND_HEALTH_URL)
            response.raise_for_status()

            health = response.json()

        stats = health.get("stats", {})

        text = (
            "📊 **RUANG NALAR AKHLAK — STATISTIK**\n\n"
            f"AI Ready: {'✅' if health.get('ai_ready') else '❌'}\n"
            f"Firebase: "
            f"{'✅' if health.get('firebase_ready') else '❌'}\n"
            f"Model: `{health.get('model', 'unknown')}`\n"
            f"Answered: {stats.get('answered', 0)}\n"
            f"Errors: {stats.get('errors', 0)}"
        )

    except Exception as e:
        log.exception("Stats request failed")

        text = (
            "⚠️ Tidak dapat mengambil statistik backend.\n"
            f"Detail: {str(e)[:200]}"
        )

    await update.message.reply_text(
        text,
        parse_mode="Markdown"
    )


# ==========================================
# ERROR HANDLER
# ==========================================

async def error_handler(
    update: object,
    context: ContextTypes.DEFAULT_TYPE
):

    log.error(
        "Telegram update error: %s",
        context.error
    )


# ==========================================
# MAIN
# ==========================================

def main():

    if not BOT_TOKEN:
        log.error("TELEGRAM_BOT_TOKEN belum diatur!")
        return

    app = (
        Application.builder()
        .token(BOT_TOKEN)
        .build()
    )

    # Commands
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_cmd))
    app.add_handler(CommandHandler("ask", ask))

    app.add_handler(CommandHandler("health", health_cmd))
    app.add_handler(CommandHandler("stats", stats_cmd))

    # Text messages
    app.add_handler(
        MessageHandler(
            filters.TEXT & ~filters.COMMAND,
            handle_message
        )
    )

    # Error handler
    app.add_error_handler(error_handler)

    log.info("Ruang Nalar Akhlak Telegram Bot starting...")

    app.run_polling()


if __name__ == "__main__":
    main()
