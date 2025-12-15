import { auth, db } from "./config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// DOM Elements
const titleInput = document.getElementById('title');
const tagsInput = document.getElementById('tags');
const bodyInput = document.getElementById('body');
const passphraseInput = document.getElementById('passphrase');
const shareInput = document.getElementById('shareEmail');
const saveButton = document.getElementById('saveBtn');
const toast = document.getElementById('toast');
const togglePassBtn = document.getElementById('togglePass');

let currentUser = null;

// Authentication 
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
    } else {
        window.location.href = "login.html";
    }
});

// eye button for password visibility
togglePassBtn.addEventListener('click', () => {
    const type = passphraseInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passphraseInput.setAttribute('type', type);
});


function showToast(msg, type = 'info') {
    toast.textContent = msg;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.className = 'toast', 3000);
}

// part of encrytption using crypto

async function deriveKey(passphrase, salt) {
    const textEncoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        textEncoder.encode(passphrase),
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
        false, 
        ["encrypt", "decrypt"]
    );
}

async function encryptData(text, passphrase) {
    const textEncoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const initializationVector = crypto.getRandomValues(new Uint8Array(12));

    const key = await deriveKey(passphrase, salt);

    const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: initializationVector },
        key,
        textEncoder.encode(text)
    );

    // Convert buffers to base64 for storage
    const saltB64 = btoa(String.fromCharCode(...salt));
    const initializationVectorB64 = btoa(String.fromCharCode(...initializationVector));
    const dataB64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));

    return {
        ciphertext: dataB64,
        salt: saltB64,
        iv: initializationVectorB64
    };
}

// --- Save Logic ---

saveButton.addEventListener('click', async () => {
    if (!currentUser) return;

    const title = titleInput.value.trim();
    const tags = tagsInput.value.trim();
    const body = bodyInput.value;
    const passphrase = passphraseInput.value;
    const shareEmail = shareInput.value.trim();

    if (!title || !body || !passphrase) {
        showToast("Please fill in Title, Body, and Passphrase", "error");
        return;
    }

    saveButton.disabled = true;
    saveButton.textContent = "Encrypting...";

    try {
        //  Encrypting only the body part
        const encryptedData = await encryptData(body, passphrase);

        

        const noteDocumentData = {
            ownerUid: currentUser.uid,
            ownerEmail: currentUser.email,
            title: title,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),

            // Encrypted Content
            encryptedBody: encryptedData.ciphertext,
            salt: encryptedData.salt,
            iv: encryptedData.iv,

            // for sharing the body
            sharedWith: shareEmail ? shareEmail.split(',').map(e => e.trim()).filter(Boolean) : [],

            createdAt: serverTimestamp()
        };

        await addDoc(collection(db, "notes"), noteDocumentData);

        showToast("Note encrypted & saved!", "success");
        setTimeout(() => {
            window.location.href = "notes.html";
        }, 1500);

    } catch (err) {
        console.error(err);
        showToast("Error saving note: " + err.message, "error");
        saveButton.disabled = false;
        saveButton.textContent = "Encrypt & Save";
    }
});
