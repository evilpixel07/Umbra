

import { auth } from "./config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            console.log("User logged in:", userCred.user);
            alert("Login successful!");
            window.location.href = "notes.html";
        } catch (err) {
            console.error("Login error:", err);
            alert("Login failed: " + err.message);
        }
    });
});
