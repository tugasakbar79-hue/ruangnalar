"""
Firebase Connector — Ruang Nalar
Monitor pertanyaan baru di Firestore, jawab pake AI
"""
import os
import json
import time
import logging
from datetime import datetime, timezone
from threading import Thread

import firebase_admin
from firebase_admin import credentials, firestore

log = logging.getLogger("ruangnalar.firebase")


class FirebaseConnector:
    def __init__(self, ai_instance=None, service_account_path: str = None):
        self.ai = ai_instance
        self.running = False
        self._thread = None
        self._last_check = None
        self._stats = {"answered": 0, "errors": 0}
        
        # Init Firebase
        sa_path = service_account_path or os.getenv(
            "FIREBASE_SERVICE_ACCOUNT",
            "service-account.json"
        )
        
        if not os.path.exists(sa_path):
            log.warning(f"Service account not found: {sa_path}")
            self.db = None
            return
        
        try:
            import firebase_admin
            try:
                firebase_admin.get_app()
                # Already initialized
                log.info("Firebase already initialized (reusing)")
            except ValueError:
                cred = credentials.Certificate(sa_path)
                firebase_admin.initialize_app(cred)
                log.info(f"Firebase initialized: {cred.project_id}")
            
            self.db = firestore.client()
        except Exception as e:
            log.error(f"Firebase init failed: {e}")
            self.db = None
    
    def set_ai(self, ai_instance):
        """Set or update AI instance."""
        self.ai = ai_instance
    
    def is_ready(self) -> bool:
        return self.db is not None and self.ai is not None
    
    def check_new_questions(self):
        """Poll Firestore for unanswered questions and answer them."""
        if not self.is_ready():
            return
        
        try:
            questions_ref = self.db.collection("pertanyaan")
            
            # Simple query without composite index requirement
            # Just get all and filter in code
            docs = questions_ref.limit(20).get()
            
            for doc in docs:
                data = doc.to_dict()
                if data.get("status") != "belum_dijawab":
                    continue
                
                question = data.get("pertanyaan", "").strip()
                
                if not question:
                    continue
                
                log.info(f"Answering: {question[:60]}...")
                
                try:
                    # Generate AI answer
                    answer = self.ai.answer(question)
                    
                    # Save to jawaban subcollection
                    jawaban_ref = self.db.collection("pertanyaan").document(doc.id).collection("jawaban")
                    jawaban_ref.add({
                        "jawaban": answer,
                        "waktu": firestore.SERVER_TIMESTAMP,
                        "pengirim": "ai"
                    })
                    
                    # Update status
                    doc.reference.update({
                        "status": "sudah_dijawab"
                    })
                    
                    self._stats["answered"] += 1
                    log.info(f"✅ Answered: {doc.id[:12]}...")
                    
                except Exception as e:
                    log.error(f"❌ Failed answering {doc.id[:12]}...: {e}")
                    self._stats["errors"] += 1
        
        except Exception as e:
            log.error(f"Firestore query failed: {e}")
    
    def start_polling(self, interval: float = 3.0):
        """Start background polling thread with auto-backoff on rate limit."""
        if self._thread and self._thread.is_alive():
            log.warning("Already polling")
            return

        self.running = True

        def _loop():
            base_interval = interval
            current_interval = base_interval
            consecutive_429 = 0
            log.info(f"Polling started (every {base_interval}s, auto-backoff on 429)")
            while self.running:
                try:
                    self.check_new_questions()
                    # Success — gradually recover interval
                    if consecutive_429 > 0:
                        consecutive_429 = max(0, consecutive_429 - 1)
                        current_interval = max(base_interval, current_interval * 0.8)
                except Exception as e:
                    err_str = str(e)
                    if "429" in err_str or "Quota" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                        consecutive_429 += 1
                        current_interval = min(300, base_interval * (2 ** consecutive_429))
                        log.warning(
                            f"⚠️ Firestore rate-limited (429). "
                            f"Backoff: {current_interval:.0f}s "
                            f"(hit #{consecutive_429})"
                        )
                    else:
                        log.error(f"Poll error: {e}")
                time.sleep(current_interval)
            log.info("Polling stopped")

        self._thread = Thread(target=_loop, daemon=True)
        self._thread.start()
    
    def stop_polling(self):
        """Stop polling."""
        self.running = False
        if self._thread:
            self._thread.join(timeout=5)
    
    def get_stats(self):
        return {
            **self._stats,
            "ready": self.is_ready(),
            "polling": self.running,
            "ai_ready": self.ai is not None,
            "db_ready": self.db is not None
        }


# Quick test
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    fc = FirebaseConnector()
    if fc.is_ready():
        print("Firebase ready! Testing query...")
        fc.check_new_questions()
        print(f"Stats: {fc.get_stats()}")
    else:
        print("Firebase not ready — check service-account.json")