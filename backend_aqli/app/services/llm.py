
import httpx

from app.config import settings


class AQLILLM:
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.model = settings.OPENROUTER_MODEL

        self.api_url = (
            "https://openrouter.ai/api/v1/chat/completions"
        )

    async def generate(
        self,
        system_prompt: str,
        user_message: str,
        context: str = ""
    ) -> str:

        if not self.api_key:
            raise RuntimeError(
                "OPENROUTER_API_KEY belum dikonfigurasi."
            )

        full_message = user_message

        if context:
            full_message = f"""
KONTEKS PENGETAHUAN AQLI:

{context}

PERTANYAAN PENGGUNA:

{user_message}

Gunakan konteks jika relevan.
Jangan mengarang sumber atau informasi.
"""

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": full_message
                }
            ],
            "temperature": 0.5,
            "max_tokens": 1200
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://ruangnalar-tau.vercel.app",
            "X-Title": "Ruang Nalar Akhlak"
        }

        timeout = httpx.Timeout(60.0, connect=15.0)

        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                self.api_url,
                headers=headers,
                json=payload
            )

            response.raise_for_status()

            result = response.json()

        try:
            answer = result["choices"][0]["message"]["content"]

            if not isinstance(answer, str) or not answer.strip():
                raise RuntimeError(
                    "AI memberikan jawaban kosong."
                )

            return answer.strip()

        except (KeyError, IndexError, TypeError) as error:
            raise RuntimeError(
                "Format jawaban OpenRouter tidak valid."
            ) from error
