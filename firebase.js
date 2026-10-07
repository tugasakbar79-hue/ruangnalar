import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    doc,
    updateDoc,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyC1adH3DgI0avmIa77QFDkNeazMOVakzYI",
    authDomain: "ruang-nalar-5a77d.firebaseapp.com",
    projectId: "ruang-nalar-5a77d",
    storageBucket: "ruang-nalar-5a77d.firebasestorage.app",
    messagingSenderId: "304252594335",
    appId: "1:304252594335:web:97d3204500dfe1d6355aaa",
    measurementId: "G-6384HZ3KRY"
};


const app =
    initializeApp(firebaseConfig);


const db =
    getFirestore(app);


export {
    db,
    collection,
    addDoc,
    doc,
    updateDoc,
    onSnapshot,
    serverTimestamp
};