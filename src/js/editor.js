import { auth, db } from "./config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// DOM Elements
const titleInput = document.getElementById('title');
const tagsInput = document.getElementById('tags');
const bodyInput = document.getElementById('body');
const passInput = document.getElementById('passphrase');
const shareInput = document.getElementById('shareEmail');
const saveBtn = document.getElementById('saveBtn');
const toast = document.getElementById('toast');
const togglePassBtn = document.getElementById('togglePass');

let currentUser = null;

// Auth Listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
    } else {
        window.location.href = "login.html";
    }
});

// Toggle Password Visibility
togglePassBtn.addEventListener('click', () => {
    const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passInput.setAttribute('type', type);
});

// Utils
function showToast(msg, type = 'info') {
    toast.textContent = msg;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.className = 'toast', 3000);
}

// --- Crypto Functions ---

async function deriveKey(passphrase, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(passphrase),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false, // Key not exportable
        ["encrypt", "decrypt"]
    );
}

async function encryptData(text, passphrase) {
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const key = await deriveKey(passphrase, salt);

    const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        enc.encode(text)
    );

    // Convert buffers to base64 for storage
    const saltB64 = btoa(String.fromCharCode(...salt));
    const ivB64 = btoa(String.fromCharCode(...iv));
    const dataB64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));

    return {
        ciphertext: dataB64,
        salt: saltB64,
        iv: ivB64
    };
}

// --- Save Logic ---

saveBtn.addEventListener('click', async () => {
    if (!currentUser) return;

    const title = titleInput.value.trim();
    const tags = tagsInput.value.trim();
    const body = bodyInput.value;
    const passphrase = passInput.value;
    const shareEmail = shareInput.value.trim();

    if (!title || !body || !passphrase) {
        showToast("Please fill in Title, Body, and Passphrase", "error");
        return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = "Encrypting...";

    try {
        // 1. Encrypt the body
        const encryptedData = await encryptData(body, passphrase);

        // 2. Prepare Firestore Document
        // Note: Title and Tags are stored in PLAIN TEXT to allow searching/filtering.
        // Only the body is encrypted. 
        // If user wants title encrypted, we'd need a separate 'display title'.
        // For this version, we assume Title is not sensitive or user uses code names.

        const docData = {
            ownerUid: currentUser.uid,
            ownerEmail: currentUser.email,
            title: title,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),

            // Encrypted Content
            encryptedBody: encryptedData.ciphertext,
            salt: encryptedData.salt,
            iv: encryptedData.iv,

            // Sharing
            sharedWith: shareEmail ? shareEmail.split(',').map(e => e.trim()).filter(Boolean) : [],

            createdAt: serverTimestamp()
        };

        await addDoc(collection(db, "notes"), docData);

        showToast("Note encrypted & saved!", "success");
        setTimeout(() => {
            window.location.href = "notes.html";
        }, 1500);

    } catch (err) {
        console.error(err);
        showToast("Error saving note: " + err.message, "error");
        saveBtn.disabled = false;
        saveBtn.textContent = "Encrypt & Save";
    }
});
