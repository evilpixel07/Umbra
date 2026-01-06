# UMBRA 
> ## An encrypted notes sharing platform



> Umbra is secure notes sharing platform , where users can create a note with a title and tags with rich text options. User can secure each note content by a password , without which no one is allowed to see it. Sharing is also possible with permissions (read or read+write) with the help of email.

**The most important things is , each and every note content is stored in encrypted form in database. Server never sees the raw content.** 
All encryption and decryption happens on the client side using the password created by the owner. 

## Table of Contents
- [Problem Statement](#problem_statement)
- [Project Overview](#project_overview)
- [Features](#features)
- [Tech Stack](#tech_stack)
- [Usage Guide](#usage_guide)
- [Setup and Installation](#setup_and_installation)
- [Demo Video](#demo_video)
- [Services used](#services_used)
- [Security](#security)
- [Credits and Attributions](#credits_and_attributions)


### Problem_Statement
> Build a sharable personal note-taking web app where notes are written in rich-text options and stored encrypted such that only the note owner (and explicitly authorized    users) can read them. Implement client-side encryption so the server stores only ciphertext. Provide add/edit/delete, optional share-with-permission (read or read+write),   and a safe export/import mechanism.


### Project_Overview
Umbra is designed for people who love privacy .
It allows users to:
- OTP based login.
- Write a note with rich text options.
- Share your notes with others .
- Can Edit a previously created note(only owner or a read+write permssion).
- Encyption and Decyption , all happens on client's side.
- Database only contains the title, tags and encrypted note.

  All Crptographic functions are done using the Modern Web API.

### Features
  - Client side encyption and decryption
  - OTP based user login
  - Rich note editor
  - Browser based
  - Password protected access to every note

### Tech_Stack
  - HTML5
  - CSS
  - JavaScript
  - Quill.js


### Usage_Guide
- Sign up with email create a password
- Login using the same email and password
- Generate OTP and verify
- click on "+new Note" to create a new note
- Add title and tags
- Write the contents
- Add a password to it and click on Encrypt to save the note.
- Move to Dashboard to see the created and shared notes
- Click on decrypt and enter the correct password to see the content.
- If you are owner
    - Click on Edit note button to edit the content and password(if you want)
    - Can add extra emails to share the access
    - Click on "Trash" icon to delete a note
    - Can change permission
- Search any note with its title or tags from the Search Bar
- Click on the tags on the right side to search directly all the notes containing that tag
- Click on Logout to log out from the Dashboard

### Setup_and_Installation
1.  Clone the git repository
```bash
git clone https://github.com/evilpixel07/Umbra
cd umbra
```
2. Install dependencies
```bash
npm install
# this installs all the dependencies to run the program
```
3. Run the program
```bash
npm rum
```

### Demo_Video
Video link: https://drive.google.com/drive/folders/1CKNyW4vnVPaBo3rAegCf9z27oAhdePIL?usp=sharing

### Services_used
1. EmailJS ( to send OTP to the registered Email)
2. Quill.js (rich text editor)
3. Web Crypto API and functions
4. DOMPurify (XSS Protection)
   
### Security
**Web Crypto API (browser based)**
- PBKDF2 : to derive encryption key from the password entered by user
- Salt and IV are generated randomly
- SHA-256 : hashing algorithm used in PBKDF2
- AES-GCM(256-bit): for encrypting the note content using the derived key

### Credits_and_Attributions
-  "**Antigravity IDE**" for code suggestions and some little fixes
-  Google gemini for CSS Edit
- [ChatGPT](chatgpt.com) for syntax and pattern of some code and other concepts of Encyption and Decryption and database funtions
- config.js taekn from [Firebase](https://firebase.google.com/) as it is to use its features
  ```js
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

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  export { app, auth, db };
  
- [Firebase](https://firebase.google.com/) for Database and methods like
  ```js
  { auth, db, onAuthStateChanged, collection, addDoc, serverTimestamp, getDoc, doc, updateDoc, setDoc, signInWithEmailAndPassword, collection, query, where, orderBy,    updateDoc, arrayUnion, deleteDoc, writeBatch, signOut , createUserWithEmailAndPassword, updateProfile }
- Followed the [**Playlist**](https://youtube.com/playlist?list=PL4cUxeGkcC9jERUGvbudErNCeSZHWUVlb&si=AVvMDumhGUAHRFji) of Net Ninja to understand the use of firebase functions
- All the CSS is done by antigravity according to my commands
- [EmailJS](https://www.emailjs.com/) for mail service

- For Brand logo and 3D animation of logo in sign up and login page is done by "AntiGravity"
  ```html
  <div class="left-panel">
      <div class="brand-logo">
        <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="shieldGrad" x1="50" y1="0" x2="50" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#3b82f6" />
              <stop offset="100%" stop-color="#06b6d4" />
            </linearGradient>
            <filter id="shadowGlow" x="-50%" y="-50%" width="200%" height="200%">
               <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="rgba(6,182,212,0.5)"/>
            </filter>
          </defs>
          <!-- Outer Shield -->
          <path d="M50 115C85 105 95 75 95 35L50 10L5 35C5 75 15 105 50 115Z" 
                fill="url(#shieldGrad)" stroke="rgba(255,255,255,0.2)" stroke-width="2" filter="url(#shadowGlow)"/>
          <!-- Inner Core / "U" shape suggestion -->
          <path d="M50 100C75 92 82 70 82 40L50 22L18 40C18 70 25 92 50 100Z" 
                fill="rgba(0,0,0,0.2)"/>
          <!-- Highlight curve -->
          <path d="M50 28L70 39C70 65 65 82 50 88V28Z" fill="rgba(255,255,255,0.1)"/>
          <!-- Central U-like lock symbol -->
          <path d="M50 45V75M38 55C38 55 42 62 50 62C58 62 62 55 62 55" 
                stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="brand-text">UMBRA</div>
    </div>
  ```
  - LOGO: <img width="95" height="80" alt="image" src="https://github.com/user-attachments/assets/a91da330-d136-4748-98c1-f5c7f91cee5c" />
 
  


 ## ***Make a visit and enjoy the security***

