
from app.core.prompts import SYSTEM_PROMPT
from app.rag.retriever import AqliRetriever
from app.services.llm import AQLILLM


class AQLIAgent:
    def __init__(self):
        self.retriever = AqliRetriever()
        self.llm = AQLILLM()

    async def ask(self, question: str) -> dict:
        question = question.strip()

        if not question:
            raise ValueError("Pertanyaan tidak boleh kosong.")

        # 1. Mengambil pengetahuan dari RAG
        documents = self.retriever.search(
            question,
            top_k=3
        )

        # 2. Menyusun konteks pengetahuan
        context_parts = []

        for document in documents:
            context_parts.append(
                f"""
Topik: {document['topic']}
Judul: {document['title']}
Materi: {document['content']}
Sumber: {document['source']}
"""
            )

        context = "\n".join(context_parts)

        # 3. Mengirim pertanyaan dan konteks ke LLM
        answer = await self.llm.generate(
            system_prompt=SYSTEM_PROMPT,
            user_message=question,
            context=context
        )

        # 4. Mengembalikan hasil
        return {
            "status": "success",
            "question": question,
            "answer": answer,
            "sources": [
                {
                    "title": document["title"],
                    "topic": document["topic"],
                    "source": document["source"]
                }
                for document in documents
            ]
        }
