/* =====================================
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
    }
};

/* ========================
   2. BACKEND CONFIG
   ======================== */
const API_URL = "https://wallpapers-meals-shortcuts-guitars.trycloudflare.com";
const API_ENDPOINT = API_URL + "/api/ask";

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
        return;
    }
    respondenNama = nama;
    respondenAsal = asal;
    localStorage.setItem('ruangnalar_responden', JSON.stringify({ nama, asal }));
    hideOnboarding();
    showRespondenBadge();
}

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