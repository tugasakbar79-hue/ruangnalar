
/* =========================================
   RUANG NALAR — DASHBOARD + AI AQLI
   FINAL VERSION
========================================= */

/* =========================================
   1. BACKEND CONFIGURATION
========================================= */

const AI_API_URL = "https://ruangnalar-tau.vercel.app/api/ask";

/* =========================================
   2. CONTOH PERTANYAAN
   Semua pertanyaan diproses oleh AI
========================================= */

const staticAnswers = {
    "Mengapa siswa harus memiliki akhlak yang baik?": {},
    "Bagaimana cara menghormati guru?": {},
    "Apa yang harus dilakukan ketika melihat teman dibully?": {},
    "Mengapa kejujuran penting bagi siswa?": {},
    "Bagaimana cara menjaga adab di media sosial?": {},
    "Bagaimana cara mengendalikan emosi ketika marah?": {}
};

/* =========================================
   3. DASHBOARD NAVIGATION
========================================= */

function initDashboard() {
    const navLinks = document.querySelectorAll(".nav-link");
    const pageViews = document.querySelectorAll(".page-view");
    const navMenu = document.getElementById("navMenu");
    const menuToggle = document.getElementById("menuToggle");

    function showView(viewName) {
        const targetView = document.getElementById("view-" + viewName);
        if (!targetView) return;

        pageViews.forEach(view => view.classList.remove("active"));
        targetView.classList.add("active");

        navLinks.forEach(link => {
            link.classList.toggle(
                "active",
                link.dataset.view === viewName
            );
        });

        if (navMenu) navMenu.classList.remove("show");

        if (menuToggle) {
            menuToggle.textContent = "☰";
            menuToggle.setAttribute("aria-expanded", "false");
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
        history.replaceState(null, "", "#" + viewName);
    }

    navLinks.forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();
            showView(link.dataset.view);
        });
    });

    const logoHome = document.getElementById("logoHome");

    if (logoHome) {
        logoHome.addEventListener("click", event => {
            event.preventDefault();
            showView("beranda");
        });
    }

    document.querySelectorAll("[data-go]").forEach(button => {
        button.addEventListener("click", () => {
            showView(button.dataset.go);
        });
    });

    const validViews = [
        "beranda",
        "kenali-akhlak",
        "praktik-akhlak",
        "studi-kasus",
        "refleksi-diri"
    ];

    const initialView = location.hash.replace("#", "");

    showView(
        validViews.includes(initialView)
            ? initialView
            : "beranda"
    );

    /* HAMBURGER */

    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", event => {
            event.stopPropagation();

            const isOpen = navMenu.classList.toggle("show");

            menuToggle.textContent = isOpen ? "✕" : "☰";
            menuToggle.setAttribute("aria-expanded", isOpen);
            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Tutup menu" : "Buka menu"
            );
        });

        document.addEventListener("click", event => {
            if (
                !navMenu.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {
                navMenu.classList.remove("show");
                menuToggle.textContent = "☰";
                menuToggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    /* PRAKTIK AKHLAK */

    const practiceChecks = document.querySelectorAll(".practice-check");
    const practiceCount = document.getElementById("practiceCount");
    const practiceProgress = document.getElementById("practiceProgress");
    const practiceMessage = document.getElementById("practiceMessage");

    const practiceKey = "ruangNalarPractice";

    function updatePractice() {
        const checked = Array.from(practiceChecks).filter(
            check => check.checked
        );

        const count = checked.length;
        const total = practiceChecks.length;
        const percentage = total ? count / total * 100 : 0;

        if (practiceCount) {
            practiceCount.textContent = count + "/" + total;
        }

        if (practiceProgress) {
            practiceProgress.style.width = percentage + "%";
        }

        if (practiceMessage) {
            practiceMessage.textContent =
                count === total
                    ? "Hebat! Kamu sudah menyelesaikan semua tantangan kebaikan hari ini."
                    : count > 0
                        ? "Bagus! Terus biasakan perbuatan baik."
                        : "Yuk, mulai biasakan satu kebaikan hari ini!";
        }

        try {
            localStorage.setItem(
                practiceKey,
                JSON.stringify(checked.map(check => check.value))
            );
        } catch (error) {
            console.warn("Progres praktik tidak dapat disimpan.");
        }
    }

    try {
        const saved = JSON.parse(
            localStorage.getItem(practiceKey) || "[]"
        );

        practiceChecks.forEach(check => {
            check.checked = saved.includes(check.value);
        });
    } catch (error) {
        console.warn("Data praktik belum tersedia.");
    }

    practiceChecks.forEach(check => {
        check.addEventListener("change", updatePractice);
    });

    updatePractice();

    /* STUDI KASUS */

    const checkCase = document.getElementById("checkCase");
    const feedback = document.getElementById("caseFeedback");

    if (checkCase && feedback) {
        checkCase.addEventListener("click", () => {
            const selected = document.querySelector(
                'input[name="caseAnswer"]:checked'
            );

            if (!selected) {
                feedback.textContent = "Pilih salah satu jawaban terlebih dahulu.";
                feedback.className = "case-feedback incorrect";
                return;
            }

            if (selected.value === "b") {
                feedback.textContent =
                    "Tepat! Menyerahkan dompet kepada guru merupakan tindakan jujur dan amanah.";
                feedback.className = "case-feedback correct";
            } else {
                feedback.textContent =
                    "Belum tepat. Coba pikirkan kembali tindakan yang menunjukkan kejujuran.";
                feedback.className = "case-feedback incorrect";
            }
        });
    }

    /* REFLEKSI DIRI */

    const reflectionForm = document.getElementById("reflectionForm");
    const reflectionHistory = document.getElementById("reflectionHistory");

    const reflectionKey = "ruangNalarReflections";

    function getReflections() {
        try {
            return JSON.parse(
                localStorage.getItem(reflectionKey) || "[]"
            );
        } catch (error) {
            return [];
        }
    }

    function renderReflections() {
        if (!reflectionHistory) return;

        const records = getReflections();
        reflectionHistory.replaceChildren();

        if (!records.length) {
            const empty = document.createElement("p");
            empty.className = "empty-reflection";
            empty.textContent = "Belum ada catatan refleksi.";
            reflectionHistory.appendChild(empty);
            return;
        }

        records.forEach(record => {
            const card = document.createElement("article");
            card.className = "reflection-record";

            const date = document.createElement("small");
            date.textContent = record.date;

            const title1 = document.createElement("h4");
            title1.textContent = "Kebaikan hari ini";

            const text1 = document.createElement("p");
            text1.textContent = record.good;

            const title2 = document.createElement("h4");
            title2.textContent = "Rencana perbaikan";

            const text2 = document.createElement("p");
            text2.textContent = record.plan;

            card.append(date, title1, text1, title2, text2);
            reflectionHistory.appendChild(card);
        });
    }

    if (reflectionForm) {
        reflectionForm.addEventListener("submit", event => {
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
                good,
                plan,
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
                alert("Refleksi berhasil disimpan.");
            } catch (error) {
                alert("Catatan belum bisa disimpan.");
            }
        });
    }

    renderReflections();

    window.showDashboardView = showView;
}

/* =========================================
   4. AI AQLI STATE
========================================= */

let conversationId = "";
let respondenNama = "";
let respondenAsal = "";
let isLoading = false;
let messageCount = 0;

const elements = {
    respondenOverlay: null,
    respondenBadge: null,
    respondenLabel: null,
    respondenNama: null,
    respondenAsal: null,
    respondenSaveBtn: null,
    respondenSkipBtn: null,
    respondenEditBtn: null,
    quickQuestions: null,
    chatMessages: null,
    typingIndicator: null,
    questionInput: null,
    sendBtn: null,
    newChatBtn: null,
    statusBar: null
};

/* =========================================
   5. CHAT UTILITIES
========================================= */

function $(id) {
    return document.getElementById(id);
}

function generateId() {
    return "msg_" + Date.now() + "_" +
        Math.random().toString(36).substring(2, 9);
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = String(text ?? "");
    return div.innerHTML;
}

function formatTimestamp() {
    return new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function showStatus(message, type = "info") {
    if (!elements.statusBar) return;

    elements.statusBar.textContent = message;
    elements.statusBar.className = "status-bar " + type;
}

function scrollToBottom(smooth = true) {
    if (!elements.chatMessages) return;

    elements.chatMessages.scrollTo({
        top: elements.chatMessages.scrollHeight,
        behavior: smooth ? "smooth" : "auto"
    });
}

function autoResizeTextarea() {
    if (!elements.questionInput) return;

    elements.questionInput.style.height = "auto";
    elements.questionInput.style.height =
        Math.min(elements.questionInput.scrollHeight, 120) + "px";
}

function setLoading(loading) {
    isLoading = loading;

    if (elements.sendBtn) {
        elements.sendBtn.disabled = loading;
        elements.sendBtn.textContent = loading
            ? "Memproses..."
            : "Kirim Pertanyaan";
    }

    if (elements.questionInput) {
        elements.questionInput.disabled = loading;
    }

    if (elements.typingIndicator) {
        elements.typingIndicator.style.display =
            loading ? "block" : "none";
    }

    if (loading) scrollToBottom();
}

/* =========================================
   6. PARSE AI RESPONSE
========================================= */

function parseAIResponse(raw) {
    const answer = String(raw || "");

    const reasonMatch = answer.match(
        /🧠\s*\*{0,2}PENJELASAN\*{0,2}\s*:?\s*([\s\S]*?)(?=☪️|$)/i
    );

    const islamMatch = answer.match(
        /☪️\s*\*{0,2}DALAM ISLAM\*{0,2}\s*:?\s*([\s\S]*?)(?=💭|📜|$)/i
    );

    const reflectMatch = answer.match(
        /💭\s*\*{0,2}REFLEKSI\*{0,2}\s*:?\s*([\s\S]*?)(?=📜|$)/i
    );

    const dalilMatch = answer.match(
        /📜\s*\*{0,2}DALIL\*{0,2}\s*:?\s*([\s\S]*?)$/i
    );

    if (!reasonMatch && !islamMatch && !reflectMatch && !dalilMatch) {
        return {
            reason: answer,
            islam: "",
            reflection: "",
            dalil: ""
        };
    }

    return {
        reason: reasonMatch?.[1].trim() || "",
        islam: islamMatch?.[1].trim() || "",
        reflection: reflectMatch?.[1].trim() || "",
        dalil: dalilMatch?.[1].trim() || ""
    };
}

/* =========================================
   7. RENDER CHAT
========================================= */

function renderUserMessage(text) {
    const id = generateId();

    const wrapper = document.createElement("div");
    wrapper.className = "msg user";
    wrapper.id = id;

    const header = document.createElement("div");
    header.className = "msg-header";
    header.textContent = "Kamu • " + formatTimestamp();

    const bubble = document.createElement("div");
    bubble.className = "msg-bubble user-bubble";
    bubble.textContent = text;

    wrapper.append(header, bubble);
    elements.chatMessages.appendChild(wrapper);

    scrollToBottom();
}

function renderAIMessage(parsed) {
    const wrapper = document.createElement("div");
    wrapper.className = "msg ai";
    wrapper.id = generateId();

    const header = document.createElement("div");
    header.className = "msg-header";
    header.textContent = "'Aqli • " + formatTimestamp();

    const bubble = document.createElement("div");
    bubble.className = "msg-bubble ai-bubble";

    const sections = [
        { icon: "🧠", label: "PENJELASAN", content: parsed.reason },
        { icon: "☪️", label: "DALAM ISLAM", content: parsed.islam },
        { icon: "💭", label: "REFLEKSI", content: parsed.reflection },
        { icon: "📜", label: "DALIL", content: parsed.dalil }
    ];

    sections.forEach(section => {
        if (!section.content) return;

        const sectionElement = document.createElement("div");
        sectionElement.className = "ai-section";

        const title = document.createElement("div");
        title.className = "section-icon";
        title.textContent = section.icon + " " + section.label;

        const content = document.createElement("div");
        content.className = "section-content";
        content.textContent = section.content;

        sectionElement.append(title, content);
        bubble.appendChild(sectionElement);
    });

    wrapper.append(header, bubble);
    elements.chatMessages.appendChild(wrapper);

    scrollToBottom();
}

/* =========================================
   8. QUICK QUESTIONS
========================================= */

function renderQuickQuestions() {
    if (!elements.quickQuestions) return;

    elements.quickQuestions.replaceChildren();

    Object.keys(staticAnswers).forEach(question => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "quick-q";
        button.textContent = question;

        button.addEventListener("click", () => {
            if (isLoading) return;

            elements.questionInput.value = question;
            autoResizeTextarea();
            handleSend();
        });

        elements.quickQuestions.appendChild(button);
    });
}

/* =========================================
   9. RESPONDEN
========================================= */

function hideOnboarding() {
    elements.respondenOverlay?.classList.add("hidden");
}

function showOnboarding() {
    elements.respondenOverlay?.classList.remove("hidden");
    elements.respondenNama?.focus();
}

function showRespondenBadge() {
    if (!elements.respondenLabel || !elements.respondenBadge) return;

    let label = respondenNama || "Anonim";

    if (respondenAsal) {
        label += " • " + respondenAsal;
    }

    elements.respondenLabel.textContent = label;
    elements.respondenBadge.style.display = "flex";
}

function loadResponden() {
    try {
        const saved = localStorage.getItem("ruangnalar_responden");

        if (saved) {
            const data = JSON.parse(saved);

            respondenNama = data.nama || "";
            respondenAsal = data.asal || "";

            hideOnboarding();
            showRespondenBadge();
        } else {
            showOnboarding();
        }
    } catch (error) {
        console.warn("Data responden belum tersedia.");
        showOnboarding();
    }
}

function saveResponden() {
    respondenNama = elements.respondenNama?.value.trim() || "";
    respondenAsal = elements.respondenAsal?.value.trim() || "";

    try {
        localStorage.setItem(
            "ruangnalar_responden",
            JSON.stringify({
                nama: respondenNama,
                asal: respondenAsal
            })
        );
    } catch (error) {
        console.warn("Data responden tidak dapat disimpan.");
    }

    hideOnboarding();
    showRespondenBadge();
}

function skipResponden() {
    respondenNama = "";
    respondenAsal = "";

    try {
        localStorage.setItem(
            "ruangnalar_responden",
            JSON.stringify({ nama: "", asal: "" })
        );
    } catch (error) {
        console.warn("Penyimpanan anonim tidak tersedia.");
    }

    hideOnboarding();
    showRespondenBadge();
}

function editResponden() {
    if (elements.respondenNama) {
        elements.respondenNama.value = respondenNama;
    }

    if (elements.respondenAsal) {
        elements.respondenAsal.value = respondenAsal;
    }

    showOnboarding();
}

/* =========================================
   10. CONVERSATION MANAGEMENT
========================================= */

function newConversation() {
    if (isLoading) return;

    conversationId = "";
    messageCount = 0;

    try {
        sessionStorage.removeItem("ruangNalarConversationId");
    } catch (error) {
        console.warn("Session storage tidak tersedia.");
    }

    if (elements.chatMessages) {
        elements.chatMessages.replaceChildren();
    }

    if (elements.quickQuestions) {
        elements.quickQuestions.style.display = "";
    }

    if (elements.questionInput) {
        elements.questionInput.value = "";
        autoResizeTextarea();
        elements.questionInput.focus();
    }

    renderQuickQuestions();
    showStatus("Obrolan baru dimulai.", "success");
}

/* =========================================
   11. SEND QUESTION TO AI
========================================= */

async function handleSend() {
    if (!elements.questionInput || !elements.chatMessages) return;

    const question = elements.questionInput.value.trim();

    if (!question || isLoading) return;

    if (messageCount === 0 && elements.quickQuestions) {
        elements.quickQuestions.style.display = "none";
    }

    renderUserMessage(question);

    elements.questionInput.value = "";
    autoResizeTextarea();

    messageCount++;
    setLoading(true);
    showStatus("", "info");

    try {
        const response = await fetch(AI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question,
                conversation_id: conversationId,
                responden_nama: respondenNama,
                responden_asal: respondenAsal
            })
        });

        let data;

        try {
            data = await response.json();
        } catch (error) {
            throw new Error("Server memberikan respons yang tidak valid.");
        }

        if (!response.ok) {
            throw new Error(
                data.detail ||
                data.error ||
                "Server error: " + response.status
            );
        }

        const answer = data.answer || data.response || data.message;

        if (!answer) {
            throw new Error("Aqli belum memberikan jawaban.");
        }

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

        renderAIMessage(parseAIResponse(answer));

    } catch (error) {
        console.error("AI API Error:", error);

        showStatus(
            "Gagal menghubungi Aqli: " + error.message,
            "error"
        );

        renderAIMessage({
            reason: "Maaf, Aqli belum dapat terhubung dengan server.",
            islam: "Silakan periksa koneksi internet atau coba beberapa saat lagi.",
            reflection: "Pertanyaanmu dapat dikirim kembali setelah layanan tersedia."
        });

    } finally {
        setLoading(false);
        elements.questionInput?.focus();
    }
}

/* =========================================
   12. LEGACY FUNCTION COMPATIBILITY
========================================= */

function selectQuestion(button) {
    if (!elements.questionInput || !button) return;

    const questionText = button.querySelector(".question-text");

    elements.questionInput.value = questionText
        ? questionText.textContent.trim()
        : button.textContent.trim();

    autoResizeTextarea();
}

function answerQuestion() {
    handleSend();
}

/* =========================================
   13. CHAT INITIALIZATION
========================================= */

function initChat() {
    elements.respondenOverlay = $("respondenOverlay");
    elements.respondenBadge = $("respondenBadge");
    elements.respondenLabel = $("respondenLabel");
    elements.respondenNama = $("respondenNama");
    elements.respondenAsal = $("respondenAsal");

    elements.respondenSaveBtn = $("respondenSaveBtn");
    elements.respondenSkipBtn = $("respondenSkipBtn");
    elements.respondenEditBtn = $("respondenEditBtn");

    elements.quickQuestions = $("quickQuestions");
    elements.chatMessages = $("chatMessages");
    elements.typingIndicator = $("typingIndicator");
    elements.questionInput = $("questionInput");
    elements.sendBtn = $("sendBtn");
    elements.newChatBtn = $("newChatBtn");
    elements.statusBar = $("statusBar");

    if (
        !elements.questionInput ||
        !elements.chatMessages ||
        !elements.sendBtn
    ) {
        return;
    }

    try {
        conversationId =
            sessionStorage.getItem("ruangNalarConversationId") || "";
    } catch (error) {
        conversationId = "";
    }

    loadResponden();
    renderQuickQuestions();

    elements.respondenSaveBtn?.addEventListener(
        "click",
        saveResponden
    );

    elements.respondenSkipBtn?.addEventListener(
        "click",
        skipResponden
    );

    elements.respondenEditBtn?.addEventListener(
        "click",
        editResponden
    );

    elements.sendBtn.addEventListener("click", handleSend);

    elements.newChatBtn?.addEventListener(
        "click",
        newConversation
    );

    elements.questionInput.addEventListener(
        "input",
        autoResizeTextarea
    );

    elements.questionInput.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    });

    const style = document.createElement("style");

    style.textContent = `
        .spinner {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid rgba(23,32,51,0.2);
            border-top-color: #172033;
            border-radius: 50%;
            animation: aqliSpin 0.8s linear infinite;
            margin-left: 8px;
            vertical-align: middle;
        }

        @keyframes aqliSpin {
            to { transform: rotate(360deg); }
        }
    `;

    document.head.appendChild(style);
}

/* =========================================
   14. MAIN INITIALIZATION
========================================= */

function initRuangNalar() {
    initDashboard();
    initChat();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRuangNalar);
} else {
    initRuangNalar();
}

/* =========================================
   15. DEBUGGING
========================================= */

window.AqliChat = {
    newConversation,
    handleSend,
    selectQuestion,
    answerQuestion,
    staticAnswers
};
