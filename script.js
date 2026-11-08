/* =====================================
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
    }


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

    answerQuestion();
}


// Mengirim pertanyaan ke AI Aqli
async function answerQuestion() {

    const questionInput = document.getElementById("questionInput");
    const answerBox = document.getElementById("answerBox");

    if (!questionInput || !answerBox) return;

    const question = questionInput.value.trim();

    if (!question) {
        alert("Silakan tulis pertanyaan terlebih dahulu.");
        return;
    }

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
