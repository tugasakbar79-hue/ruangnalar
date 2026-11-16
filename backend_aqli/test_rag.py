
from app.rag.retriever import AqliRetriever

print("=== AQLI RAG TEST ===")

retriever = AqliRetriever()

questions = [
    "Bagaimana cara menerapkan kejujuran saat ujian?",
    "Bagaimana cara mengendalikan emosi?",
    "Apa arti tanggung jawab bagi pelajar?"
]

for question in questions:
    print("\n" + "=" * 50)
    print("PERTANYAAN:", question)

    results = retriever.search(question, top_k=3)

    if not results:
        print("Tidak ditemukan dokumen.")
        continue

    for result in results:
        print("TOPIK:", result["topic"])
        print("JUDUL:", result["title"])
        print("SKOR:", result["score"])
        print("ISI:", result["content"])

print("\n=== PENGUJIAN SELESAI ===")
