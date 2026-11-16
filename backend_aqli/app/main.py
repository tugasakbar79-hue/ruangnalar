
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.config import settings
from app.services.aqli import AQLIAgent


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "AQLI AI adalah asisten edukasi "
        "untuk pembelajaran dan penerapan akhlak."
    )
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


# Inisialisasi AQLI AI
aqli = AQLIAgent()


class AskRequest(BaseModel):
    question: str = Field(
        min_length=2,
        max_length=2000
    )


@app.get("/")
async def root():
    return {
        "name": "AQLI AI",
        "platform": "Ruang Nalar Akhlak",
        "version": settings.APP_VERSION,
        "status": "running"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "ai": "AQLI AI",
        "version": settings.APP_VERSION
    }


@app.post("/api/ask")
async def ask(request: AskRequest):
    try:
        result = await aqli.ask(request.question)
        return result

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    except Exception as error:
        print("\n========== AQLI ERROR ==========")
        print("Jenis error:", type(error).__name__)
        print("Pesan error:", str(error))
        import traceback
        traceback.print_exc()
        print("================================\n")

        raise HTTPException(
            status_code=502,
            detail="AQLI sedang mengalami gangguan. Silakan coba kembali."
        )