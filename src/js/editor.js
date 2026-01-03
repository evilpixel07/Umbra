import { auth, db } from "./config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { collection, addDoc, serverTimestamp, getDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// DOM Elements
const titleInput = document.getElementById('title');
const tagsInput = document.getElementById('tags');
const passphraseInput = document.getElementById('passphrase');
const shareInput = document.getElementById('shareEmail');
const sharePermissionInput = document.getElementById('sharePermission');
const saveButton = document.getElementById('saveBtn');
const toast = document.getElementById('toast');
const togglePassBtn = document.getElementById('togglePass');

let currentUser = null;
let editId = null;
let currentNoteData = null;


const urlParams = new URLSearchParams(window.location.search);
editId = urlParams.get('id');

// Initializing the Quill.js editor
var quill = new Quill('#editor-container', {
    theme: 'snow',
    placeholder: 'Write your private note here...',
    modules: {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }]
            
        ]
    }
});

// to be shown while user tries to update the note
if (editId) {
    document.querySelector('.app-title').textContent = "Edit Note";
    document.querySelector('strong').textContent = "Edit Encrypted Note";
    saveButton.textContent = "Update Note";

    const passHelp = passphraseInput.parentElement.nextElementSibling;
    if (passHelp) {
        passHelp.textContent = "IMPORTANT: You can change the password here, if you just replace it with a new one.";
    }

    // hide share access button while editing
    const shareContainer = shareInput.closest('.field');
    if (shareContainer) shareContainer.style.display = 'none';


}


onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        if (editId) {
            await loadNoteForEdit(editId);
        }
    } else {
        window.location.href = "login.html";
    }
});

async function loadNoteForEdit(id) {
    try {
        const docRef = doc(db, "notes", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            currentNoteData = docSnap.data();
            titleInput.value = currentNoteData.title || "";
            tagsInput.value = (currentNoteData.tags || []).join(", ");

            // Cache type storage if user refresh the page without saving the updated note
            const sessionKey = `session_note_data_${id}`;
            const sessionData = sessionStorage.getItem(sessionKey);

            if (sessionData) {
                try {
                    const { content, passphrase } = JSON.parse(sessionData);
                    quill.root.innerHTML = content;
                    passphraseInput.value = passphrase;

                    const existingLoadBtn = passphraseInput.parentElement.querySelector('button.ghost');
                    if (existingLoadBtn) {
                        existingLoadBtn.style.display = 'none';
                        showToast("Content Auto-Loaded", "success");
                    }
                } catch (e) {
                    console.error("Error parsing session data", e);
                }
            }
        } else {
            alert("Note not found");
            window.location.href = "notes.html";
        }
    } catch (e) {
        console.error("Error loading note:", e);
        showToast("Error loading note", "error");
    }
}

// eye button for password checking
togglePassBtn.addEventListener('click', () => {
    const type = passphraseInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passphraseInput.setAttribute('type', type);
});


function showToast(msg, type = 'info') {
    toast.textContent = msg;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.className = 'toast', 3000);
}

// part of encrytption and decryption using crypto(PBKDF2 and SHA-256 and AES-GCM based)

async function decryptData(noteData, passphrase) {
    const textEncoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey("raw", textEncoder.encode(passphrase), { name: "PBKDF2" }, false, ["deriveKey"]);

    const salt = Uint8Array.from(atob(noteData.salt), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(noteData.iv), c => c.charCodeAt(0));
    const ciphertext = Uint8Array.from(atob(noteData.encryptedBody), c => c.charCodeAt(0));

    const key = await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, ciphertext);
    const decoded = new TextDecoder().decode(decrypted);

    return decoded;
}

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

    // Converting buffers to base64 for storage
    const saltB64 = btoa(String.fromCharCode(...salt));
    const initializationVectorB64 = btoa(String.fromCharCode(...initializationVector));
    const dataB64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));

    return {
        ciphertext: dataB64,
        salt: saltB64,
        iv: initializationVectorB64
    };
}

// --- Logic part for saving the note ---

saveButton.addEventListener('click', async () => {
    if (!currentUser) return;

    const title = titleInput.value.trim();
    const tags = tagsInput.value.trim();
    const body = quill.root.innerHTML;
    const passphrase = passphraseInput.value;
    const shareEmail = shareInput.value.trim();

    if (!title || !body || !passphrase) {
        showToast("Please fill in Title, Body, and Passphrase", "error");
        return;
    }

    saveButton.disabled = true;
    saveButton.textContent = "Encrypting...";

    try {
        const encryptedData = await encryptData(body, passphrase);

        if (editId) {
            // Updatint the existing data if user is editing the content
            const updateData = {
                title: title,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                encryptedBody: encryptedData.ciphertext,
                salt: encryptedData.salt,
                iv: encryptedData.iv,
                updatedAt: serverTimestamp()
            };

            await updateDoc(doc(db, "notes", editId), updateData);
            showToast("Note updated!", "success");
        } else {
            // create the new notes data if creating a new note
            const emailList = shareEmail ? shareEmail.split(',').map(e => e.trim()).filter(Boolean) : [];
            const permission = sharePermissionInput.value;

            const sharedPermissions = {};
            emailList.forEach(email => {
                sharedPermissions[email] = permission;
            });

            const noteDocumentData = {
                ownerUid: currentUser.uid,
                ownerEmail: currentUser.email,
                title: title,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                encryptedBody: encryptedData.ciphertext,
                salt: encryptedData.salt,
                iv: encryptedData.iv,
                sharedWith: emailList,
                sharedPermissions: sharedPermissions,
                createdAt: serverTimestamp()
            };
            await addDoc(collection(db, "notes"), noteDocumentData);
            showToast("Note encrypted & saved!", "success");
        }

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
