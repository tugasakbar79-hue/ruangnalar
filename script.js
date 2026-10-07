const answers = {
    "Mengapa manusia diberikan akal?": {
        reason: "Akal membantu manusia berpikir, memahami sesuatu, mempertimbangkan pilihan, dan mengambil keputusan.",

        islam: "Dalam Islam, akal merupakan anugerah Allah kepada manusia. Akal digunakan untuk memahami kehidupan dan mencari kebenaran, dengan tetap menjadikan ajaran Islam sebagai pedoman.",

        reflection: "Apakah selama ini akal yang kamu miliki sudah digunakan untuk mencari ilmu dan mengambil keputusan yang baik?"
    },

    "Kalau sudah ditakdirkan, mengapa manusia harus berusaha?": {
        reason: "Manusia tidak mengetahui apa yang akan terjadi di masa depan. Karena itu, manusia tetap perlu berusaha dan bertanggung jawab atas pilihannya.",

        islam: "Islam mengajarkan manusia untuk berusaha kemudian menyerahkan hasilnya kepada Allah. Takdir bukan alasan untuk berhenti berusaha.",

        reflection: "Apakah kamu sudah melakukan usaha terbaik sebelum menyerahkan hasilnya kepada Allah?"
    },

    "Kalau berkata jujur bisa menyakiti seseorang, apakah tetap harus jujur?": {
        reason: "Kejujuran tetap penting, tetapi cara menyampaikannya juga perlu diperhatikan agar tidak sengaja menyakiti atau merendahkan orang lain.",

        islam: "Islam mengajarkan kejujuran sekaligus akhlak yang baik. Kebenaran sebaiknya disampaikan dengan cara yang bijaksana.",

        reflection: "Ketika mengatakan sebuah kebenaran, apakah cara penyampaianmu sudah mencerminkan akhlak yang baik?"
    },

    "Bagaimana Islam memandang berpikir kritis?": {
        reason: "Berpikir kritis membantu manusia tidak menerima informasi begitu saja. Kita perlu memeriksa alasan, bukti, dan sumber informasi.",

        islam: "Islam mendorong manusia menggunakan akalnya dan tidak mengikuti sesuatu tanpa pengetahuan. Sikap kritis dapat membantu mencari kebenaran dengan tetap berpegang pada nilai Islam.",

        reflection: "Apakah kamu biasanya memeriksa kebenaran sebuah informasi sebelum mempercayainya?"
    },

    "Bagaimana cara menyikapi informasi di media sosial?": {
        reason: "Informasi di media sosial sangat beragam. Kita perlu memeriksa sumber dan kebenaran informasi sebelum mempercayai atau menyebarkannya.",

        islam: "Islam mengajarkan pentingnya memeriksa berita sebelum mempercayai atau menyebarkannya kepada orang lain.",

        reflection: "Sebelum membagikan informasi, apakah kamu sudah memastikan bahwa informasi tersebut benar?"
    },

    "Mengapa manusia sering merasa tidak puas dengan hidupnya?": {
        reason: "Manusia memiliki keinginan dan harapan yang terus berkembang. Jika tidak disertai rasa syukur, keinginan tersebut dapat membuat seseorang terus merasa kurang.",

        islam: "Islam mengajarkan manusia untuk berusaha memperbaiki kehidupan sekaligus mensyukuri nikmat yang telah diberikan Allah.",

        reflection: "Apa yang sudah kamu miliki hari ini yang sering kali lupa kamu syukuri?"
    }
};


// Memilih pertanyaan dari tombol
function selectQuestion(button) {

    const question = button.textContent.trim();

    document.getElementById("questionInput").value = question;

    answerQuestion();
}


// Menampilkan jawaban
function answerQuestion() {

    const questionInput =
        document.getElementById("questionInput");

    const question =
        questionInput.value.trim();

    if (question === "") {
        alert("Silakan tulis atau pilih pertanyaan terlebih dahulu.");
        return;
    }


    // KIRIM PERTANYAAN KE FIREBASE
    if (typeof window.kirimKeFirebase === "function") {
        window.kirimKeFirebase(question);
    }


    const answerBox =
        document.getElementById("answerBox");


    let answer = answers[question];


    // Jika pertanyaan belum tersedia
    if (!answer) {

        answer = {
            reason: "Pertanyaan ini dapat dilihat dari berbagai sudut pandang. Cobalah memahami masalahnya dengan tenang dan mempertimbangkan alasan serta akibat dari setiap pilihan.",

            islam: "Dalam Islam, manusia dianjurkan menggunakan akal sekaligus menjadikan nilai-nilai Islam sebagai pedoman dalam memahami kehidupan.",

            reflection: "Apa sebenarnya persoalan utama dari pertanyaanmu?"
        };

    }


    // Masukkan jawaban ke HTML

    document.getElementById("answerQuestion").textContent =
        question;

    document.getElementById("reasonAnswer").textContent =
        answer.reason;

    document.getElementById("islamAnswer").textContent =
        answer.islam;

    document.getElementById("reflectionAnswer").textContent =
        answer.reflection;


    // Tampilkan kotak jawaban

    answerBox.classList.add("show");


    // Scroll ke jawaban

    answerBox.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}