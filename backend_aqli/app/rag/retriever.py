
import json
import re
from pathlib import Path

from rank_bm25 import BM25Okapi


BASE_DIR = Path(__file__).resolve().parent
KNOWLEDGE_FILE = BASE_DIR / "knowledge.json"

# Kata umum yang tidak banyak membantu pencarian materi.
STOPWORDS = {
    "yang", "dan", "di", "ke", "dari", "ini", "itu",
    "dengan", "untuk", "pada", "adalah", "atau",
    "bagaimana", "mengapa", "kenapa", "apa", "siapa",
    "kapan", "dimana", "apakah", "saat", "ketika",
    "dalam", "agar", "bisa", "dapat", "akan",
    "cara", "sebuah", "secara", "lebih", "sangat",
    "saya", "aku", "kamu", "kita", "mereka",
    "oleh", "karena", "jika", "juga", "tidak",
    "bukan", "sudah", "belum", "telah", "harus",
    "menjadi", "tersebut", "seperti", "misalnya"
}


class AqliRetriever:
    def __init__(self):
        self.documents = []
        self.tokenized_documents = []
        self.bm25 = None

        self.load_knowledge()

    def tokenize(self, text: str) -> list[str]:
        text = text.lower()

        tokens = re.findall(
            r"\b[a-zA-Z0-9]+\b",
            text
        )

        return [
            token for token in tokens
            if token not in STOPWORDS and len(token) > 2
        ]

    def load_knowledge(self):
        if not KNOWLEDGE_FILE.exists():
            raise FileNotFoundError(
                f"Knowledge base tidak ditemukan: {KNOWLEDGE_FILE}"
            )

        with open(KNOWLEDGE_FILE, "r", encoding="utf-8") as file:
            self.documents = json.load(file)

        if not self.documents:
            raise ValueError("Knowledge base masih kosong.")

        self.tokenized_documents = []

        for document in self.documents:
            searchable_text = " ".join([
                document.get("topic", ""),
                document.get("title", ""),
                document.get("content", ""),
                " ".join(document.get("keywords", []))
            ])

            self.tokenized_documents.append(
                self.tokenize(searchable_text)
            )

        self.bm25 = BM25Okapi(
            self.tokenized_documents
        )

        print(
            f"[AQLI RAG] Berhasil memuat "
            f"{len(self.documents)} dokumen."
        )

    def search(
        self,
        query: str,
        top_k: int = 3
    ) -> list[dict]:

        if not query or not query.strip():
            return []

        if self.bm25 is None:
            return []

        query_tokens = self.tokenize(query)

        if not query_tokens:
            return []

        scores = self.bm25.get_scores(query_tokens)

        ranked_indices = sorted(
            range(len(scores)),
            key=lambda index: scores[index],
            reverse=True
        )

        results = []

        for index in ranked_indices:
            document = self.documents[index]
            score = float(scores[index])

            if score <= 0:
                continue

            # Prioritaskan kecocokan pada topik dan judul.
            topic_title_tokens = set(
                self.tokenize(
                    document.get("topic", "") + " " +
                    document.get("title", "")
                )
            )

            keyword_tokens = set(
                self.tokenize(
                    " ".join(document.get("keywords", []))
                )
            )

            query_set = set(query_tokens)

            topic_matches = query_set & topic_title_tokens
            keyword_matches = query_set & keyword_tokens

            # Tambahan skor untuk kecocokan yang lebih spesifik.
            final_score = (
                score
                + (2.0 * len(topic_matches))
                + (1.5 * len(keyword_matches))
            )

            results.append({
                "id": document.get("id"),
                "topic": document.get("topic"),
                "title": document.get("title"),
                "content": document.get("content"),
                "source": document.get("source"),
                "score": round(final_score, 4)
            })

        results.sort(
            key=lambda item: item["score"],
            reverse=True
        )

        return results[:top_k]
