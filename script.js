/* =====================================
<<<<<<< HEAD
   1. DATA JAWABAN TANYA AKHLAK
===================================== */



/* =====================================
   2. NAVIGASI DASHBOARD
===================================== */

document.addEventListener("DOMContentLoaded", function () {

    const navLinks = document.querySelectorAll(".nav-link");
    const pageViews = document.querySelectorAll(".page-view");
    const navMenu = document.getElementById("navMenu");
    const menuToggle = document.getElementById("menuToggle");

    function showView(viewName) {

        const targetView = document.getElementById("view-" + viewName);

        if (!targetView) return;

        // Sembunyikan seluruh halaman
        pageViews.forEach(function (view) {
            view.classList.remove("active");
        });

        // Tampilkan halaman pilihan
        targetView.classList.add("active");

        // Atur menu aktif
        navLinks.forEach(function (link) {
            link.classList.toggle(
                "active",
                link.dataset.view === viewName
            );
        });

        // Tutup hamburger
        if (navMenu) {
            navMenu.classList.remove("show");
        }

        if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", "false");
        }

        // Kembali ke posisi paling atas
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        // Ubah alamat hash tanpa reload
        history.replaceState(null, "", "#" + viewName);
=======
   RUANG NALAR — TANYA 'AQLI (CHAT MODE)
   Interactive multi-turn chat with conversation history
   Static 6 Q&A as quick-start chips + Custom → 'Aqli Backend
   ===================================== */

/* ========================
   1. STATIC Q&A DATA (6 PRESET)
   ======================== */
const staticAnswers = {
    "Mengapa siswa harus memiliki akhlak yang baik?": {
        reason: "Akhlak membantu siswa membangun hubungan yang baik dengan orang lain, menjaga perilaku, dan bertanggung jawab atas tindakannya.",
        islam: "Islam mengajarkan bahwa akhlak mulia merupakan bagian penting dari kehidupan seorang muslim. Ilmu dan kecerdasan sebaiknya disertai perilaku yang baik.",
        reflection: "Apakah perilakumu di sekolah sudah mencerminkan akhlak yang baik?"
    },
    "Bagaimana cara menghormati guru?": {
        reason: "Menghormati guru dapat dilakukan dengan mendengarkan ketika guru menjelaskan, berbicara dengan sopan, dan menghargai nasihatnya.",
        islam: "Islam mengajarkan umatnya untuk menghormati orang yang berilmu dan menghargai orang yang telah memberikan ilmu.",
        reflection: "Apakah kamu sudah menghargai guru melalui perkataan dan tindakanmu?"
    },
    "Apa yang harus dilakukan ketika melihat teman dibully?": {
        reason: "Jangan ikut mengejek atau menyebarkan kejadian tersebut. Berikan dukungan kepada teman yang mengalami perundungan dan mintalah bantuan guru atau orang dewasa yang dipercaya.",
        islam: "Islam mengajarkan manusia untuk saling menghormati, tidak menyakiti orang lain, dan membantu sesama dalam kebaikan.",
        reflection: "Jika melihat teman diperlakukan tidak baik, tindakan positif apa yang bisa kamu lakukan?"
    },
    "Mengapa kejujuran penting bagi siswa?": {
        reason: "Kejujuran membangun kepercayaan dan melatih tanggung jawab. Siswa yang jujur berani mengakui kesalahan dan tidak mengambil hak orang lain.",
        islam: "Islam mengajarkan umatnya untuk berkata dan bertindak jujur dalam kehidupan sehari-hari.",
        reflection: "Apakah kamu tetap berkata jujur ketika melakukan kesalahan?"
    },
    "Bagaimana cara menjaga adab di media sosial?": {
        reason: "Gunakan bahasa yang sopan, hindari komentar yang merendahkan orang lain, dan pikirkan dampak sebelum mengunggah sesuatu.",
        islam: "Islam mengajarkan manusia untuk menjaga lisan. Dalam kehidupan digital, prinsip tersebut juga perlu diterapkan dalam tulisan dan komentar.",
        reflection: "Apakah komentar dan unggahanmu di media sosial sudah mencerminkan akhlak yang baik?"
    },
    "Bagaimana cara meminta maaf ketika melakukan kesalahan?": {
        reason: "Akui kesalahan dengan jujur, sampaikan permintaan maaf dengan tulus, dan berusaha memperbaiki perilaku agar tidak mengulanginya.",
        islam: "Islam mengajarkan pentingnya mengakui kesalahan, bertaubat kepada Allah, dan meminta maaf kepada orang yang telah dirugikan.",
        reflection: "Apakah kamu berani mengakui kesalahan dan memperbaikinya?"
>>>>>>> origin/main
    }

/* ========================
   2. BACKEND CONFIG
   ======================== */
const API_URL = "https://wallpapers-meals-shortcuts-guitars.trycloudflare.com";
const API_ENDPOINT = API_URL + "/api/ask";

<<<<<<< HEAD
    // Klik navbar
    navLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            event.preventDefault();

            showView(this.dataset.view);

        });

    });


    // Klik logo kembali ke beranda
    const logoHome = document.getElementById("logoHome");

    if (logoHome) {
        logoHome.addEventListener("click", function (event) {
            event.preventDefault();
            showView("beranda");
        });
    }


    // Klik tombol fitur di beranda
    document.querySelectorAll("[data-go]").forEach(function (button) {

        button.addEventListener("click", function () {
            showView(this.dataset.go);
        });

    });


    // Membaca halaman dari URL
    const initialView = location.hash.replace("#", "");

    const validViews = [
        "beranda",
        "kenali-akhlak",
        "praktik-akhlak",
        "studi-kasus",
        "refleksi-diri"
    ];

    if (validViews.includes(initialView)) {
        showView(initialView);
    } else {
        showView("beranda");
    }


    /* =====================================
       3. MENU HAMBURGER
    ===================================== */

     
/* =====================================
   3. MENU HAMBURGER
===================================== */

if (menuToggle && navMenu) {

    menuToggle.addEventListener("click", function (event) {
        event.stopPropagation();

        const isOpen = navMenu.classList.toggle("show");

        menuToggle.textContent = isOpen ? "✕" : "☰";
        menuToggle.setAttribute("aria-expanded", isOpen);

        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Tutup menu" : "Buka menu"
        );
    });

    navMenu.querySelectorAll("a").forEach(function (link) {

        link.addEventListener("click", function () {

            navMenu.classList.remove("show");

            menuToggle.textContent = "☰";
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Buka menu");

        });

    });

    document.addEventListener("click", function (event) {

        if (
            !navMenu.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {

            navMenu.classList.remove("show");

            menuToggle.textContent = "☰";
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Buka menu");

        }

    });

}



    /* =====================================
       4. PRAKTIK AKHLAK
    ===================================== */

    const practiceChecks = document.querySelectorAll(".practice-check");
    const practiceCount = document.getElementById("practiceCount");
    const practiceProgress = document.getElementById("practiceProgress");
    const practiceMessage = document.getElementById("practiceMessage");

    const practiceKey = "ruangNalarPractice";

    function loadPractice() {

        try {

            const saved = JSON.parse(
                localStorage.getItem(practiceKey)
            ) || [];

            practiceChecks.forEach(function (check) {
                check.checked = saved.includes(check.value);
            });

        } catch (error) {
            console.log("Data praktik belum tersedia.");
        }

        updatePractice();
    }

    function updatePractice() {

        const checked = Array.from(practiceChecks).filter(
            check => check.checked
        );

        const count = checked.length;
        const total = practiceChecks.length;
        const percentage = total ? (count / total) * 100 : 0;

        if (practiceCount) {
            practiceCount.textContent = count + "/" + total;
        }

        if (practiceProgress) {
            practiceProgress.style.width = percentage + "%";
        }

        if (practiceMessage) {

            if (count === total) {
                practiceMessage.textContent =
                    "Hebat! Kamu sudah menyelesaikan semua tantangan kebaikan hari ini.";
            } else if (count > 0) {
                practiceMessage.textContent =
                    "Bagus! Terus biasakan perbuatan baik dalam kehidupan sehari-hari.";
            } else {
                practiceMessage.textContent =
                    "Yuk, mulai biasakan satu kebaikan hari ini!";
            }
        }

        const values = checked.map(check => check.value);

        try {
            localStorage.setItem(
                practiceKey,
                JSON.stringify(values)
            );
        } catch (error) {
            console.log("Progres belum bisa disimpan.");
        }
    }

    practiceChecks.forEach(function (check) {
        check.addEventListener("change", updatePractice);
    });

    loadPractice();


    /* =====================================
       5. STUDI KASUS
    ===================================== */

    const checkCase = document.getElementById("checkCase");
    const feedback = document.getElementById("caseFeedback");

    if (checkCase && feedback) {

        checkCase.addEventListener("click", function () {

            const selected = document.querySelector(
                'input[name="caseAnswer"]:checked'
            );

            if (!selected) {

                feedback.textContent =
                    "Pilih salah satu jawaban terlebih dahulu.";

                feedback.className = "case-feedback incorrect";

                return;
            }

            if (selected.value === "b") {

                feedback.textContent =
                    "Tepat! Menyerahkan dompet kepada guru merupakan tindakan jujur dan amanah.";

                feedback.className = "case-feedback correct";

            } else {

                feedback.textContent =
                    "Belum tepat. Coba pikirkan kembali tindakan yang menunjukkan kejujuran dan tanggung jawab.";

                feedback.className = "case-feedback incorrect";

            }

        });

    }


    /* =====================================
       6. REFLEKSI DIRI
    ===================================== */

    const reflectionForm = document.getElementById("reflectionForm");
    const reflectionHistory = document.getElementById("reflectionHistory");

    const reflectionKey = "ruangNalarReflections";

    function getReflections() {

        try {
            return JSON.parse(
                localStorage.getItem(reflectionKey)
            ) || [];
        } catch (error) {
            return [];
        }

    }

    function renderReflections() {

        if (!reflectionHistory) return;

        const records = getReflections();

        reflectionHistory.replaceChildren();

        if (records.length === 0) {

            const empty = document.createElement("p");

            empty.className = "empty-reflection";
            empty.textContent = "Belum ada catatan refleksi.";

            reflectionHistory.appendChild(empty);

            return;
        }

        records.forEach(function (record) {

            const card = document.createElement("article");
            card.className = "reflection-record";

            const date = document.createElement("small");
            date.textContent = record.date;

            const firstTitle = document.createElement("h4");
            firstTitle.textContent = "Kebaikan hari ini";

            const firstText = document.createElement("p");
            firstText.textContent = record.good;

            const secondTitle = document.createElement("h4");
            secondTitle.textContent = "Rencana perbaikan";

            const secondText = document.createElement("p");
            secondText.textContent = record.plan;

            card.append(
                date,
                firstTitle,
                firstText,
                secondTitle,
                secondText
            );

            reflectionHistory.appendChild(card);

        });

    }

    if (reflectionForm) {

        reflectionForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const good = document.getElementById(
                "reflectionAnswer"
            ).value.trim();

            const plan = document.getElementById(
                "reflectionPlan"
            ).value.trim();

            if (!good || !plan) return;

            const records = getReflections();

            records.unshift({
                good: good,
                plan: plan,
                date: new Date().toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                })
            });

            try {

                localStorage.setItem(
                    reflectionKey,
                    JSON.stringify(records.slice(0, 30))
                );

                reflectionForm.reset();

                renderReflections();

                alert("Refleksi berhasil disimpan di perangkat ini.");

            } catch (error) {

                alert("Catatan belum bisa disimpan.");

            }

        });

    }

    renderReflections();

});


/* =====================================
   7. TANYA AKHLAK
===================================== */


/* =====================================
   7. TANYA AKHLAK — AI AQLI
===================================== */

// Endpoint backend FastAPI di Vercel
const AI_API_URL = "https://ruangnalar-tau.vercel.app/api/ask";

// ID percakapan agar Aqli dapat memahami konteks sebelumnya
let conversationId = "";

try {
    conversationId =
        sessionStorage.getItem("ruangNalarConversationId") || "";
} catch (error) {
    console.warn("Session storage tidak tersedia.");
}

// Mencegah pengiriman pertanyaan berulang
let isAsking = false;


// Memilih pertanyaan yang tersedia
function selectQuestion(button) {

    const questionInput = document.getElementById("questionInput");

    if (!questionInput || !button) return;

    const questionText = button.querySelector(".question-text");

    questionInput.value = questionText
        ? questionText.textContent.trim()
        : button.textContent.trim();
=======
/* ========================
   3. STATE MANAGEMENT
   ======================== */
let conversationId = "";
let respondenNama = "";
let respondenAsal = "";
let isLoading = false;
let messageCount = 0;

/* ========================
   4. DOM ELEMENTS (cached)
   ======================== */
const elements = {
    // Onboarding
    respondenOverlay: null,
    respondenBadge: null,
    respondenLabel: null,
    respondenNama: null,
    respondenAsal: null,
    respondenSaveBtn: null,
    respondenSkipBtn: null,
    respondenEditBtn: null,

    // Chat
    quickQuestions: null,
    chatMessages: null,
    typingIndicator: null,
    questionInput: null,
    sendBtn: null,
    newChatBtn: null,
    statusBar: null
};
>>>>>>> origin/main

/* ========================
   5. UTILITY FUNCTIONS
   ======================== */
function $(id) { return document.getElementById(id); }

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

<<<<<<< HEAD
// Mengirim pertanyaan ke AI Aqli
async function answerQuestion() {

    const questionInput = document.getElementById("questionInput");
    const answerBox = document.getElementById("answerBox");

    if (!questionInput || !answerBox) return;

    const question = questionInput.value.trim();

    if (!question) {
        alert("Silakan tulis pertanyaan terlebih dahulu.");
=======
function generateId() {
    return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function showStatus(message, type = 'info') {
    const bar = elements.statusBar;
    bar.textContent = message;
    bar.className = 'status-bar ' + type;
    if (type !== 'info') {
        setTimeout(() => { bar.className = 'status-bar'; bar.textContent = ''; }, 4000);
    }
}

function setLoading(loading) {
    isLoading = loading;
    elements.sendBtn.disabled = loading;
    elements.questionInput.disabled = loading;
    elements.sendBtn.innerHTML = loading
        ? 'Memproses... <span class="spinner"></span>'
        : 'Kirim';
    elements.typingIndicator.style.display = loading ? 'flex' : 'none';
    if (loading) scrollToBottom();
}

function scrollToBottom(smooth = true) {
    const container = elements.chatMessages;
    container.scrollTo({ top: container.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
}

function autoResizeTextarea() {
    const ta = elements.questionInput;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
}

/* ========================
   6. PARSE AI RESPONSE (4 sections)
   ======================== */
function parseAIResponse(raw) {
    const a = raw;
    const reasonMatch = a.match(/🧠\s*\*{0,2}PENJELASAN\*{0,2}\s*:?\s*([\s\S]*?)(?=☪️|$)/);
    const islamMatch = a.match(/☪️\s*\*{0,2}DALAM ISLAM\*{0,2}\s*:?\s*([\s\S]*?)(?=💭|📜|$)/);
    const reflectMatch = a.match(/💭\s*\*{0,2}REFLEKSI\*{0,2}\s*:?\s*([\s\S]*?)(?=📜|$)/);
    const dalilMatch = a.match(/📜\s*\*{0,2}DALIL\*{0,2}\s*:?\s*([\s\S]*?)$/);

    return {
        reason: (reasonMatch && reasonMatch[1].trim()) || "Tidak ada penjelasan tersedia.",
        islam: (islamMatch && islamMatch[1].trim()) || "Tidak ada perspektif Islam tersedia.",
        reflection: (reflectMatch && reflectMatch[1].trim()) || "Tidak ada refleksi tersedia.",
        dalil: (dalilMatch && dalilMatch[1].trim()) || ""
    };
}

/* ========================
   7. RENDER FUNCTIONS
   ======================== */
function renderUserMessage(text) {
    const msgId = generateId();
    const html = `
        <div class="msg user" id="${msgId}" data-role="user">
            <div class="msg-header">Kamu • ${formatTimestamp()}</div>
            <div class="msg-bubble user-bubble">
                <div class="msg-text">${escapeHtml(text)}</div>
            </div>
        </div>
    `;
    elements.chatMessages.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
    return msgId;
}

function renderAIMessage(parsed, isStatic = false) {
    const msgId = generateId();
    const sections = [
        { icon: '🧠', label: 'PENJELASAN', content: parsed.reason },
        { icon: '☪️', label: 'DALAM ISLAM', content: parsed.islam },
        { icon: '💭', label: 'REFLEKSI', content: parsed.reflection }
    ];
    if (parsed.dalil) {
        sections.push({ icon: '📜', label: 'DALIL', content: parsed.dalil });
    }

    const sectionsHtml = sections.map(s => `
        <div class="ai-section">
            <div class="section-icon">${s.icon} <span>${s.label}</span></div>
            <div class="section-content">${escapeHtml(s.content)}</div>
        </div>
    `).join('<div class="section-divider"></div>');

    const badge = isStatic ? '<span style="font-size:10px;background:#fff3e0;color:#e65100;padding:2px 6px;border-radius:4px;margin-left:8px;">PRESET</span>' : '';

    const html = `
        <div class="msg ai" id="${msgId}" data-role="assistant">
            <div class="msg-header">'Aqli • ${formatTimestamp()}${badge}</div>
            <div class="msg-bubble ai-bubble">${sectionsHtml}</div>
        </div>
    `;
    elements.chatMessages.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
    return msgId;
}

function renderQuickQuestions() {
    const questions = Object.keys(staticAnswers);
    elements.quickQuestions.innerHTML = questions.map(q => `
        <button class="quick-q" role="listitem" data-question="${escapeHtml(q)}" aria-label="${escapeHtml(q)}">${escapeHtml(q)}</button>
    `).join('');

    // Event delegation
    elements.quickQuestions.querySelectorAll('.quick-q').forEach(btn => {
        btn.addEventListener('click', () => {
            const q = btn.dataset.question;
            elements.questionInput.value = q;
            autoResizeTextarea();
            handleSend();
        });
    });
}

/* ========================
   8. RESPONDEN / ONBOARDING
   ======================== */
function loadResponden() {
    const saved = localStorage.getItem('ruangnalar_responden');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            respondenNama = data.nama || '';
            respondenAsal = data.asal || '';
            showRespondenBadge();
        } catch (e) { /* ignore */ }
    } else {
        showOnboarding();
    }
}

function showOnboarding() {
    elements.respondenOverlay.classList.remove('hidden');
    elements.respondenNama.focus();
}

function hideOnboarding() {
    elements.respondenOverlay.classList.add('hidden');
}

function showRespondenBadge() {
    let label = 'Anonim';
    if (respondenNama) label = respondenNama;
    if (respondenAsal) label += ' • ' + respondenAsal;
    elements.respondenLabel.textContent = label;
    elements.respondenBadge.style.display = 'flex';
}

function saveResponden() {
    const nama = elements.respondenNama.value.trim();
    const asal = elements.respondenAsal.value.trim();
    if (!nama && !asal) {
        skipResponden();
>>>>>>> origin/main
        return;
    }
    respondenNama = nama;
    respondenAsal = asal;
    localStorage.setItem('ruangnalar_responden', JSON.stringify({ nama, asal }));
    hideOnboarding();
    showRespondenBadge();
}

<<<<<<< HEAD
    if (isAsking) return;

    isAsking = true;

    // Tampilkan loading
    answerBox.replaceChildren();

    const loading = document.createElement("p");
    loading.textContent = "Aqli sedang memikirkan jawaban...";
    loading.className = "ai-loading";

    answerBox.appendChild(loading);
    answerBox.classList.add("show");

    answerBox.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    try {

        const response = await fetch(AI_API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                question: question,
                conversation_id: conversationId
            })

        });

        // Membaca respons backend
        const data = await response.json();

        if (!response.ok) {

            const errorMessage =
                data.detail || data.error || "Terjadi kesalahan pada server.";

            throw new Error(errorMessage);
        }

        if (!data.answer || !data.answer.trim()) {
            throw new Error("Aqli tidak memberikan jawaban.");
        }

        // Simpan ID percakapan
        if (data.conversation_id) {

            conversationId = data.conversation_id;

            try {
                sessionStorage.setItem(
                    "ruangNalarConversationId",
                    conversationId
                );
            } catch (error) {
                console.warn("ID percakapan tidak dapat disimpan.");
            }
        }

        // Buat judul pertanyaan
        const questionTitle = document.createElement("h3");

        questionTitle.textContent = question;
        questionTitle.className = "ai-question-title";

        // Buat area jawaban AI
        const answerContent = document.createElement("div");

        answerContent.className = "ai-answer-content";

        // Gunakan textContent agar jawaban aman ditampilkan
        answerContent.textContent = data.answer;

        // Atur tampilan jawaban
        answerContent.style.whiteSpace = "pre-wrap";
        answerContent.style.lineHeight = "1.8";
        answerContent.style.overflowWrap = "anywhere";

        // Tampilkan jawaban asli Aqli
        answerBox.replaceChildren(
            questionTitle,
            answerContent
        );

    } catch (error) {

        console.error("Kesalahan AI Aqli:", error);

        answerBox.replaceChildren();

        const errorTitle = document.createElement("h3");
        errorTitle.textContent = "Aqli belum dapat menjawab.";

        const errorText = document.createElement("p");
        errorText.textContent = error.message;

        const retryText = document.createElement("p");
        retryText.textContent =
            "Silakan periksa koneksi dan coba kirim pertanyaan kembali.";

        answerBox.append(
            errorTitle,
            errorText,
            retryText
        );

    } finally {

        isAsking = false;

    }

}
=======
function skipResponden() {
    respondenNama = '';
    respondenAsal = '';
    localStorage.setItem('ruangnalar_responden', JSON.stringify({ nama: '', asal: '' }));
    hideOnboarding();
    showRespondenBadge(); // will show "Anonim"
}

function editResponden() {
    elements.respondenNama.value = respondenNama;
    elements.respondenAsal.value = respondenAsal;
    showOnboarding();
}

/* ========================
   9. CONVERSATION MANAGEMENT
   ======================== */
function newConversation() {
    conversationId = "";
    elements.chatMessages.innerHTML = '';
    messageCount = 0;
    renderQuickQuestions();
    showStatus('Obrolan baru dimulai. Silakan ajukan pertanyaan.', 'success');
    elements.questionInput.value = '';
    autoResizeTextarea();
    elements.questionInput.focus();
}

function getConversationHistory() {
    // Ambil dari DOM messages (user + assistant pairs)
    const messages = [];
    const msgElements = elements.chatMessages.querySelectorAll('.msg[data-role]');
    msgElements.forEach(el => {
        const role = el.dataset.role;
        const bubble = el.querySelector('.msg-bubble');
        if (bubble) {
            // For AI messages, reconstruct the formatted answer
            if (role === 'assistant') {
                const sections = bubble.querySelectorAll('.ai-section');
                let fullText = '';
                sections.forEach(sec => {
                    const icon = sec.querySelector('.section-icon');
                    const content = sec.querySelector('.section-content');
                    if (icon && content) {
                        const label = icon.textContent.trim().replace(/^[🧠☪️💭📜]\s*/, '');
                        fullText += `${icon.textContent.trim().split(' ')[0]} ${label}: ${content.textContent.trim()}\n\n`;
                    }
                });
                messages.push({ role: 'assistant', content: fullText.trim() });
            } else {
                const textEl = bubble.querySelector('.msg-text');
                if (textEl) {
                    messages.push({ role: 'user', content: textEl.textContent.trim() });
                }
            }
        }
    });
    return messages;
}

/* ========================
   10. MAIN SEND LOGIC
   ======================== */
async function handleSend() {
    const question = elements.questionInput.value.trim();
    if (!question || isLoading) return;

    // Clear quick questions after first user message
    if (messageCount === 0) {
        elements.quickQuestions.innerHTML = '';
        elements.quickQuestions.style.display = 'none';
    }

    // Render user message immediately
    renderUserMessage(question);
    elements.questionInput.value = '';
    autoResizeTextarea();
    messageCount++;
    setLoading(true);

    try {
        // Check static answer first (exact match)
        const staticAnswer = staticAnswers[question];
        if (staticAnswer && messageCount === 1) {
            // Only use static for first message to keep chat natural
            setLoading(false);
            renderAIMessage(staticAnswer, true);
            return;
        }

        // Get conversation history for context
        const history = getConversationHistory();

        // Call backend
        const response = await fetch(API_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                question: question,
                conversation_id: conversationId,
                responden_nama: respondenNama,
                responden_asal: respondenAsal
            })
        });

        if (!response.ok) {
            if (response.status === 429) throw new Error("Terlalu banyak permintaan. Coba lagi nanti.");
            throw new Error("Server error: " + response.status);
        }

        const data = await response.json();

        // Update conversation ID from backend
        if (data.conversation_id) conversationId = data.conversation_id;

        // Parse and render
        const parsed = parseAIResponse(data.answer || "");
        setLoading(false);
        renderAIMessage(parsed, false);

    } catch (error) {
        console.error("API Error:", error);
        setLoading(false);
        showStatus("Gagal: " + error.message, 'error');

        // Fallback render
        const fallback = {
            reason: "Maaf, terjadi gangguan koneksi. Coba kirim pertanyaan lagi nanti.",
            islam: "Dalam Islam, kesabaran dan istiqamah dalam mencari ilmu sangat dianjurkan.",
            reflection: "Apa yang bisa kamu lakukan saat menghadapi kendala teknis?"
        };
        renderAIMessage(fallback, false);
    }
}

/* ========================
   11. INITIALIZATION
   ======================== */
function init() {
    // Cache elements
    elements.respondenOverlay = $('respondenOverlay');
    elements.respondenBadge = $('respondenBadge');
    elements.respondenLabel = $('respondenLabel');
    elements.respondenNama = $('respondenNama');
    elements.respondenAsal = $('respondenAsal');
    elements.respondenSaveBtn = $('respondenSaveBtn');
    elements.respondenSkipBtn = $('respondenSkipBtn');
    elements.respondenEditBtn = $('respondenEditBtn');
    elements.quickQuestions = $('quickQuestions');
    elements.chatMessages = $('chatMessages');
    elements.typingIndicator = $('typingIndicator');
    elements.questionInput = $('questionInput');
    elements.sendBtn = $('sendBtn');
    elements.newChatBtn = $('newChatBtn');
    elements.statusBar = $('statusBar');

    // Load responden
    loadResponden();

    // Render quick questions initially
    renderQuickQuestions();

    // Event listeners
    elements.respondenSaveBtn.addEventListener('click', saveResponden);
    elements.respondenSkipBtn.addEventListener('click', skipResponden);
    elements.respondenEditBtn.addEventListener('click', editResponden);

    elements.sendBtn.addEventListener('click', handleSend);
    elements.newChatBtn.addEventListener('click', newConversation);

    elements.questionInput.addEventListener('input', autoResizeTextarea);
    elements.questionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    // Focus input on load (after onboarding)
    setTimeout(() => {
        if (!elements.respondenOverlay.classList.contains('hidden')) {
            elements.respondenNama.focus();
        } else {
            elements.questionInput.focus();
        }
    }, 100);

    // Inject spinner CSS
    const style = document.createElement('style');
    style.textContent = `
        .spinner {
            display: inline-block; width: 14px; height: 14px;
            border: 2px solid rgba(23,32,51,0.2); border-top-color: #172033;
            border-radius: 50%; animation: spin 0.8s linear infinite;
            margin-left: 8px; vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
}

// Start when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Expose for debugging
window.AqliChat = {
    newConversation,
    handleSend,
    getConversationHistory,
    staticAnswers
};
>>>>>>> origin/main
