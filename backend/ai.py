"""
AI Module — Ruang Nalar
OpenRouter integration untuk menjawab pertanyaan
"""
import os
import json
import httpx

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
    
    def answer(self, question: str, system_prompt: str = None) -> str:
        """Generate an answer for a question using direct HTTP call."""
        messages = [
            {"role": "system", "content": system_prompt or DEFAULT_SYSTEM_PROMPT},
            {"role": "user", "content": question}
        ]
        
        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": 1024,
            "temperature": 0.7,
            "top_p": 0.9,
        }
        
        try:
            with httpx.Client(timeout=30.0) as client:
                resp = client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json=payload
                )
                resp.raise_for_status()
                data = resp.json()
                return data["choices"][0]["message"]["content"].strip()
        
        except httpx.HTTPStatusError as e:
            raise RuntimeError(f"OpenRouter HTTP {e.response.status_code}: {e.response.text[:500]}")
        except Exception as e:
            raise RuntimeError(f"AI call failed: {str(e)[:300]}")
    
    def verify_format(self, answer: str) -> bool:
        """Check if answer has the required sections."""
        has_reason = "🧠" in answer or "PENJELASAN" in answer
        has_islam = "☪️" in answer or "DALAM ISLAM" in answer
        has_reflection = "💭" in answer or "REFLEKSI" in answer
        return has_reason and has_islam and has_reflection


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