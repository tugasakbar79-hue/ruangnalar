
"""
AI Module — Ruang Nalar Akhlak
OpenRouter integration untuk pembelajaran dan refleksi akhlak siswa.
"""

import os
import sys
import httpx

# Direktori utama project
_BASE = os.path.dirname(os.path.abspath(__file__))

if _BASE not in sys.path:
    sys.path.insert(0, _BASE)

from prompts import SYSTEM_PROMPT


class RuangNalarAI:

    def __init__(self, api_key: str = None, model: str = None):

        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")

        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY required")

        self.model = model or os.getenv(
            "AI_MODEL",
            "deepseek/deepseek-v4-flash"
        )

        self.base_url = "https://openrouter.ai/api/v1"

        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://ruangnalar-tau.vercel.app",
            "X-Title": "Ruang Nalar Akhlak"
        }

    def _needs_religious_reference(self, question: str) -> bool:
        """
        Menentukan apakah pertanyaan membutuhkan referensi
        Al-Qur'an atau hadis.
        """

        keywords = [
            "dalil",
            "ayat al-qur'an",
            "ayat alquran",
            "ayat al quran",
            "hadis",
            "hadits",
            "surah",
            "surat",
            "menurut islam",
            "hukum islam",
            "ajaran islam",
            "landasan islam",
            "dasar islam"
        ]

        text = question.lower()

        return any(keyword in text for keyword in keywords)

    def answer(
        self,
        question: str,
        system_prompt: str = None,
        history: list = None
    ) -> str:

        if not isinstance(question, str) or not question.strip():
            raise ValueError("Pertanyaan tidak boleh kosong.")

        if len(question) > 10000:
            raise ValueError("Pertanyaan terlalu panjang.")

        # Mode pemeliharaan AI
        if os.getenv("AI_PAUSED", "").lower() in (
            "true", "1", "yes"
        ):
            return (
                "Aqli sedang dalam pengembangan sementara. "
                "Silakan kembali lagi nanti untuk melanjutkan "
                "pembelajaran akhlak."
            )

        # Gunakan prompt utama dari prompts.py
        system = system_prompt or SYSTEM_PROMPT

        messages = [
            {
                "role": "system",
                "content": system
            }
        ]

        # Riwayat percakapan
        if history:
            for msg in history[-10:]:

                if not isinstance(msg, dict):
                    continue

                role = msg.get("role")
                content = msg.get("content")

                if (
                    role in ("user", "assistant")
                    and isinstance(content, str)
                    and content.strip()
                ):
                    messages.append({
                        "role": role,
                        "content": content[:10000]
                    })

        user_content = question.strip()

        # RAG hanya digunakan jika referensi agama diperlukan
        if self._needs_religious_reference(question):

            try:
                from rag import retriever

                if retriever.is_ready():

                    rag_rows = retriever.search(
                        question,
                        k=5
                    ) or []

                    if rag_rows:

                        dalil_block = retriever.format_dalil(
                            rag_rows
                        )

                        if dalil_block:

                            user_content = (
                                "REFERENSI KEISLAMAN YANG TERSEDIA:\n"
                                f"{dalil_block}\n\n"
                                "Gunakan referensi hanya jika sesuai "
                                "dengan pertanyaan. Jelaskan dengan "
                                "bahasa yang mudah dipahami. Jangan "
                                "mengarang sumber atau memaksakan "
                                "dalil yang tidak relevan.\n\n"
                                f"PERTANYAAN SISWA:\n{question}"
                            )

            except Exception:
                # Jika RAG gagal, AI tetap menjawab pertanyaan.
                user_content = question.strip()

        messages.append({
            "role": "user",
            "content": user_content
        })

        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": 2048,
            "temperature": 0.7,
            "top_p": 0.9
        }

        try:

            with httpx.Client(timeout=60.0) as client:

                response = client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json=payload
                )

                response.raise_for_status()

                data = response.json()

                choices = data.get("choices", [])

                if not choices:
                    raise RuntimeError(
                        "OpenRouter tidak mengembalikan jawaban."
                    )

                message = choices[0].get("message", {})
                raw = message.get("content")

                if isinstance(raw, list):
                    raw = "\n".join(
                        item.get("text", "")
                        for item in raw
                        if isinstance(item, dict)
                    )

                if not isinstance(raw, str) or not raw.strip():
                    raise RuntimeError(
                        "AI tidak memberikan jawaban."
                    )

                # Tidak menambahkan template atau dalil otomatis.
                return raw.strip()

        except httpx.HTTPStatusError as e:

            raise RuntimeError(
                f"OpenRouter HTTP {e.response.status_code}: "
                f"{e.response.text[:500]}"
            )

        except httpx.RequestError as e:

            raise RuntimeError(
                f"Gagal menghubungi OpenRouter: {str(e)[:300]}"
            )

        except Exception as e:

            raise RuntimeError(
                f"AI call failed: {str(e)[:300]}"
            )

    def verify_format(self, answer: str) -> bool:
        """
        Memeriksa apakah jawaban AI berisi teks.
        Tidak lagi mewajibkan tiga bagian jawaban.
        """

        return (
            isinstance(answer, str)
            and bool(answer.strip())
        )


# ==========================================
# PENGUJIAN LOKAL
# ==========================================

if __name__ == "__main__":

    from dotenv import load_dotenv

    load_dotenv()

    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:

        print("OPENROUTER_API_KEY belum tersedia di file .env")

    else:

        try:

            ai = RuangNalarAI(api_key=api_key)

            test_questions = [
                "Jelaskan tentang akhlak kepada kakak kelas.",
                "Mengapa kejujuran penting bagi seorang pelajar?",
                "Bagaimana cara menjaga sopan santun di sekolah?"
            ]

            print("RUANG NALAR AKHLAK")
            print("=" * 60)

            for question in test_questions:

                print("\nPERTANYAAN:")
                print(question)

                print("\nJAWABAN AQLI:")
                answer = ai.answer(question)

                print(answer)

                print("\nJawaban valid:", ai.verify_format(answer))
                print("=" * 60)

        except Exception as error:

            print("Terjadi kesalahan:", error)
