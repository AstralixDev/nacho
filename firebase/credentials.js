import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCaCTg4xVuEfhBzI6UqrMFA1fd1VENx-BM",
    authDomain: "naxo-3fe1b.firebaseapp.com",
    projectId: "naxo-3fe1b",
    storageBucket: "naxo-3fe1b.firebasestorage.app",
    messagingSenderId: "846275011037",
    appId: "1:846275011037:web:2b7691dc6fb45480c75634"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);