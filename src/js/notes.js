import { auth, db } from "./config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { collection, query, where, getDocs, orderBy, updateDoc, doc, arrayUnion } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// DOM Elements
const notesContainer = document.getElementById('notesContainer');
const createNewNoteButton = document.getElementById('createBtn');
const logoutButton = document.getElementById('logoutBtn');
const globalSearch = document.getElementById('globalSearch');
const notesCount = document.getElementById('notesCount');

// Modals
const decryptModal = document.getElementById('decryptModal');
const viewModal = document.getElementById('viewModal');
const shareModal = document.getElementById('shareModal');

// Modal Elements
const decryptPass = document.getElementById('decryptPass');
const confirmDecrypt = document.getElementById('confirmDecrypt');
const decryptNoteTitle = document.getElementById('decryptNoteTitle');

const viewTitle = document.getElementById('viewTitle');
const viewBody = document.getElementById('viewBody');
const viewTags = document.getElementById('viewTags');
const shareBtnTrigger = document.getElementById('shareBtnTrigger');

const shareEmailInput = document.getElementById('shareEmailInput');
const confirmShare = document.getElementById('confirmShare');

const toast = document.getElementById('toast');

let currentUser = null;
let currentNote = null; 

// --- Authentication and Initialization ---

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        loadNotes();
    } else {
        window.location.href = "login.html";
    }
});

createNewNoteButton.addEventListener('click', () => {
    window.location.href = "editor.html";
});

logoutButton.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = "login.html";
});

// --- Loading all the notes  ---

async function loadNotes() {
    notesContainer.innerHTML = '<div class="loading-state">Syncing encrypted vault...</div>';

    try {
        const myNotesQuery = query(collection(db, "notes"), where("ownerUid", "==", currentUser.uid), orderBy("createdAt", "desc"));
        const sharedNotesQuery = query(collection(db, "notes"), where("sharedWith", "array-contains", currentUser.email), orderBy("createdAt", "desc"));

        const [myNotesSnapshot, sharedNotesSnapshot] = await Promise.all([getDocs(myNotesQuery), getDocs(sharedNotesQuery)]);

        const notes = [];
        myNotesSnapshot.forEach(doc => notes.push({ id: doc.id, ...doc.data(), isOwner: true }));
        sharedNotesSnapshot.forEach(doc => notes.push({ id: doc.id, ...doc.data(), isOwner: false }));

        notes.sort((a, b) => b.createdAt - a.createdAt);

        renderNotes(notes);
        notesCount.textContent = notes.length;
        renderTagCloud(notes); 

    } catch (err) {
        console.error(err);
        notesContainer.innerHTML = '<div class="error-state">Failed to load notes. Network error?</div>';
    }
}

function renderTagCloud(notes) {
    const tagCounts = {};
    notes.forEach(note => {
        (note.tags || []).forEach(tag => {
            const t = tag.trim();
            if (t) tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
    });

    const cloud = document.getElementById('tagCloud');
    if (!cloud) return;

    cloud.innerHTML = '';
    const sortedTags = Object.keys(tagCounts).sort();

    if (sortedTags.length === 0) {
        cloud.innerHTML = '<div class="small muted">No tags found</div>';
        return;
    }

    sortedTags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = `${tag} (${tagCounts[tag]})`;
        span.onclick = () => {
            globalSearch.value = tag;
            globalSearch.dispatchEvent(new Event('input'));
        };
        cloud.appendChild(span);
    });
}

function renderNotes(notes) {
    notesContainer.innerHTML = '';

    if (notes.length === 0) {
        notesContainer.innerHTML = `
            <div class="empty-state">
                <h3>No notes found</h3>
                <p>Create your first secure note to get started.</p>
            </div>`;
        return;
    }

    notes.forEach(note => {
        const card = document.createElement('div');
        card.className = 'note-card dashboard-card';

        const tagHtml = (note.tags || []).map(t => `<span class="tag">${t}</span>`).join('');

        card.innerHTML = `
            <div class="note-header">
                <span class="note-title">${note.title || 'Untitled'}</span>
                ${note.isOwner ? '<span class="badge owner">Owner</span>' : '<span class="badge shared">Shared</span>'}
            </div>
            <div class="note-tags">${tagHtml}</div>
            <div class="note-meta">
                <span>${note.ownerEmail}</span>
                <span class="action-hint">Click to decrypt</span>
            </div>
        `;

        card.addEventListener('click', () => openDecryptModal(note));
        notesContainer.appendChild(card);
    });
}

// --- Searching for any Note ---

globalSearch.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.note-card');

    cards.forEach(card => {
        const title = card.querySelector('.note-title').textContent.toLowerCase();
        // Tags are also in the text content
        if (card.textContent.toLowerCase().includes(term)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
});

// --- Modal Logic ---

function openModal(modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeModal(modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        closeModal(modal);
    });
});

// Decrypt Modal
function openDecryptModal(note) {
    currentNote = note;
    decryptNoteTitle.textContent = `Decrypting: ${note.title}`;
    decryptPass.value = '';
    openModal(decryptModal);
    decryptPass.focus();
}

confirmDecrypt.addEventListener('click', async () => {
    const decryptionPassword = decryptPass.value;
    if (!decryptionPassword) return;

    confirmDecrypt.textContent = "Decrypting...";

    try {
        const plainText = await decryptData(currentNote, decryptionPassword);
        closeModal(decryptModal);
        openViewModal(currentNote, plainText);
    } catch (err) {
        showToast("Access Denied: Wrong Passphrase", "error");
        console.error(err);
    } finally {
        confirmDecrypt.textContent = "Unlock";
    }
});

// View Modal
function openViewModal(note, content) {
    viewTitle.textContent = note.title;
    viewBody.textContent = content; // Textarea-like display

    viewTags.innerHTML = (note.tags || []).map(t => `<span class="tag">${t}</span>`).join('');

    if (note.isOwner) {
        shareBtnTrigger.style.display = "inline-block";
        shareBtnTrigger.onclick = () => {
            // Stack modals? Or close view? Let's just open share on top
            openModal(shareModal);
        };
    } else {
        shareBtnTrigger.style.display = "none";
    }

    openModal(viewModal);
}

// Share Modal
confirmShare.addEventListener('click', async () => {
    const email = shareEmailInput.value.trim();
    if (!email) return;

    confirmShare.textContent = "Sharing...";

    try {
        await updateDoc(doc(db, "notes", currentNote.id), {
            sharedWith: arrayUnion(email)
        });
        showToast(`Access granted to ${email}`, "success");
        closeModal(shareModal);
    } catch (err) {
        showToast("Error sharing: " + err.message, "error");
    } finally {
        confirmShare.textContent = "Grant Access";
    }
});

// --- Crypto Decryption (Mirror of Editor) ---

async function decryptData(noteData, passphrase) {
    const textEncoder = new TextEncoder();

    // 1. Import Key (PBKDF2)
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        textEncoder.encode(passphrase),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    // 2. Decode Base64 Metadata
    const salt = Uint8Array.from(atob(noteData.salt), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(noteData.iv), c => c.charCodeAt(0));
    const ciphertext = Uint8Array.from(atob(noteData.encryptedBody), c => c.charCodeAt(0));

    // 3. Derive Key
    const key = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
    );

    // 4. Decrypt
    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        ciphertext
    );

    const textDecoder = new TextDecoder();
    return textDecoder.decode(decrypted);
}

function showToast(msg, type = 'info') {
    toast.textContent = msg;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.className = 'toast', 3000);
}
