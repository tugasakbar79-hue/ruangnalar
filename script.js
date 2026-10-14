/* =====================================
   1. DATA JAWABAN TANYA AKHLAK
===================================== */

const answers = {
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

function selectQuestion(button) {

    const questionInput = document.getElementById("questionInput");

    if (!questionInput || !button) return;

    const questionText = button.querySelector(".question-text");

    questionInput.value = questionText
        ? questionText.textContent.trim()
        : button.textContent.trim();

    answerQuestion();
}


function answerQuestion() {

    const questionInput = document.getElementById("questionInput");
    const answerBox = document.getElementById("answerBox");

    if (!questionInput || !answerBox) return;

    const question = questionInput.value.trim();

    if (!question) {
        alert("Silakan tulis atau pilih pertanyaan terlebih dahulu.");
        return;
    }

    let answer = answers[question];

    if (!answer) {

        answer = {
            reason: "Pertanyaan ini dapat dipahami dengan mempertimbangkan situasi, alasan, dan dampak dari tindakan yang dilakukan.",

            islam: "Dalam Islam, setiap muslim dianjurkan untuk menjaga akhlak, menghormati sesama, dan menjadikan nilai-nilai Islam sebagai pedoman dalam bertindak.",

            reflection: "Apa tindakan terbaik yang dapat kamu lakukan agar tetap menjaga akhlak dalam situasi tersebut?"
        };

    }

    const questionElement = document.getElementById("answerQuestion");
    const reasonElement = document.getElementById("reasonAnswer");
    const islamElement = document.getElementById("islamAnswer");
    const reflectionElement = document.getElementById("reflectionAnswer");

    if (questionElement) questionElement.textContent = question;
    if (reasonElement) reasonElement.textContent = answer.reason;
    if (islamElement) islamElement.textContent = answer.islam;
    if (reflectionElement) reflectionElement.textContent = answer.reflection;

    answerBox.classList.add("show");

    if (typeof window.kirimKeFirebase === "function") {

        try {
            window.kirimKeFirebase(question);
        } catch (error) {
            console.error("Gagal mengirim pertanyaan ke Firebase:", error);
        }

    }

    answerBox.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}