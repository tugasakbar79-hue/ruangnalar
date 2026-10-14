"""
AI Module — Ruang Nalar
OpenRouter integration untuk menjawab pertanyaan
"""
import os
import json
import sys
import httpx

# Allow importing rag/ submodule
_BASE = os.path.dirname(os.path.abspath(__file__))
if _BASE not in sys.path:
    sys.path.insert(0, _BASE)

# Default system prompt
DEFAULT_SYSTEM_PROMPT = """Kamu adalah asisten Ruang Nalar, seorang ahli teologi dan filsafat Islam yang bertugas menjawab pertanyaan pengguna dengan pendekatan nalar (reasoning) yang bijaksana.

GAYA BERBICARA:
- Gunakan bahasa Indonesia yang santun, hangat, dan reflektif
- Tidak menggurui, tidak menghakimi, tidak memaksakan pendapat
- Ajak pengguna berpikir, bukan sekadar memberi jawaban instan
- Jawab dengan tenang, seperti seorang guru yang sedang duduk berhadapan dengan muridnya

STRUKTUR JAWABAN:
Jawab dalam 3 bagian yang dipisah dengan line break dan emoji:

🧠 PENJELASAN:
(Jelaskan secara logis dan rasional)

☪️ DALAM ISLAM:
(Kaitkan dengan ajaran Islam)

💭 REFLEKSI:
(Pertanyaan reflektif untuk pengguna)

PEDOMAN:
1. Jika ditanya tentang Islam, jawab berdasarkan Al-Quran dan Sunnah
2. Kaitkan nalar/logika dengan konsep 'aql dalam Islam
3. JANGAN berfatwa tanpa dalil
4. JANGAN merendahkan agama/kepercayaan lain
5. JANGAN menjawab di luar kompetensi
6. Gunakan gelar untuk Nabi: 'Nabi Muhammad SAW' atau 'Rasulullah SAW'
7. Jika ada perbedaan pendapat ulama, sebutkan dengan adil"""


class RuangNalarAI:
    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY required")
        
        self.model = model or os.getenv("AI_MODEL", "deepseek/deepseek-v4-flash")
        self.base_url = "https://openrouter.ai/api/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://ruangnalar.dev",
            "X-Title": "Ruang Nalar AI",
        }
    
    def answer(self, question: str, system_prompt: str = None, history: list = None) -> str:
        """Generate an answer for a question using direct HTTP call.

        If the RAG index is available, retrieves relevant Quran/Hadith
        dalil and injects it as context so the model quotes real sources.
        history: list of {"role": "user"|"assistant", "content": str}
        """
        if os.getenv("AI_PAUSED", "").lower() in ("true", "1", "yes"):
            return (
                "🧠 **'Aqli sedang istirahat**\n\n"
                "Terima kasih sudah bertanya. Saat ini 'Aqli sedang tidak aktif "
                "karena masih dalam pengembangan untuk riset murid-murid. "
                "Insyaallah akan aktif kembali saat sesi presentasi nanti.\n\n"
                "📚 Sementara itu, silakan lanjutkan diskusi dan eksplorasi "
                "bersama teman-teman kelompokmu!"
            )
        system = system_prompt or DEFAULT_SYSTEM_PROMPT
        messages = [{"role": "system", "content": system}]

        # Insert conversation history (clean messages, no RAG)
        if history:
            for msg in history:
                messages.append({"role": msg["role"], "content": msg["content"]})

        # RAG: retrieve dalil (best-effort, never fatal)
        user_content = question
        self._rag_rows = []
        try:
            from rag import retriever
            if retriever.is_ready():
                rows = retriever.search(question, k=5)
                self._rag_rows = rows
                dalil_block = retriever.format_dalil(rows)
                if dalil_block:
                    # put dalil context first so the model anchors on it
                    user_content = f"{dalil_block}\n\nTUGAS: Jawab pertanyaan ini dengan merujuk dalil di atas:\n{question}"
        except Exception:
            pass  # RAG unavailable — fall back to plain Q&A

        messages.append({"role": "user", "content": user_content})
        
        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": 3072,
            "temperature": 0.7,
            "top_p": 0.9,
        }
        
        try:
            with httpx.Client(timeout=60.0) as client:
                resp = client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json=payload
                )
                resp.raise_for_status()
                data = resp.json()
                msg = data["choices"][0]["message"]
                raw = msg.get("content")
                if raw is None:
                    fallback = msg.get("reasoning") or "(model tidak memberikan jawaban langsung)"
                    answer = str(fallback).strip()
                else:
                    answer = raw.strip()
                # Append deterministic DALIL block from retrieval results
                dalil_extra = self._build_dalil_section()
                if dalil_extra:
                    answer = answer.rstrip() + "\n\n📜 DALIL:\n" + dalil_extra
                return answer

        except httpx.HTTPStatusError as e:
            raise RuntimeError(f"OpenRouter HTTP {e.response.status_code}: {e.response.text[:500]}")
        except Exception as e:
            raise RuntimeError(f"AI call failed: {str(e)[:300]}")
    
    def _build_dalil_section(self, max_items: int = 3) -> str:
        """Build the 📜 DALIL block from the last retrieval (deterministic)."""
        rows = getattr(self, "_rag_rows", []) or []
        if not rows:
            return ""
        lines = []
        for r in rows[:max_items]:
            if r["type"] == "quran":
                t = r.get("tafsir", {})
                name = t.get("surah_name", "")
                terjemah = (r.get("id_text") or "").strip()
                line = f"- QS. {r['ref']}"
                if name:
                    line += f" ({name})"
                if terjemah:
                    line += f" — {terjemah[:220]}"
                lines.append(line)
            else:
                imam = r.get("imam", "").title()
                nomor = r.get("nomor", "")
                terjemah = (r.get("id_text") or "").strip()
                arab = (r.get("arab") or "").strip()
                line = f"- HR. {imam} no. {nomor}"
                if arab:
                    line += f" — {arab[:120]}"
                if terjemah:
                    line += f"\n  ({terjemah[:220]})"
                lines.append(line)
        return "\n".join(lines)

    def verify_format(self, answer: str) -> bool:
        """Check if answer has the required sections."""
        has_reason = "🧠" in answer or "PENJELASAN" in answer
        has_islam = "☪️" in answer or "DALAM ISLAM" in answer
        has_dalil = "📜" in answer or "DALIL" in answer
        has_reflection = "💭" in answer or "REFLEKSI" in answer
        return has_reason and has_islam and has_dalil and has_reflection


# Simple test
if __name__ == "__main__":
    import os
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        try:
            from dotenv import load_dotenv
            load_dotenv()
            api_key = os.getenv("OPENROUTER_API_KEY")
        except:
            pass
    
    if api_key:
        ai = RuangNalarAI(api_key=api_key)
        test_q = "Mengapa manusia diberikan akal?"
        print(f"Q: {test_q}")
        print("=" * 40)
        ans = ai.answer(test_q)
        print(ans)
        print("=" * 40)
        print(f"Format valid: {ai.verify_format(ans)}")
    else:
        print("Set OPENROUTER_API_KEY di .env untuk testing")