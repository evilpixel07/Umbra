import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA8X2g1S_JupLjM4M5OIe7VbKB0CdtDB0Y",
    authDomain: "umbra1-db540.firebaseapp.com",
    projectId: "umbra1-db540",
    storageBucket: "umbra1-db540.firebasestorage.app",
    messagingSenderId: "1026682993312",
    appId: "1:1026682993312:web:bd0e7da577d9812968e7c5"
};

// Initializing the services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
