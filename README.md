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


 ## ***Make a visit and enjoy the security***

