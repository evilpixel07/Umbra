import { auth } from "./config.js";
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const signupForm = document.querySelector('form');

if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm').value;

    if (password !== confirm) {
      return alert("Passwords do not match.");
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      // Updating display name if user provided username
      if (username) {
        await updateProfile(userCred.user, { displayName: username });
      }

      console.log("Account created", userCred.user);
      alert("Account created! Redirecting to login...");
      window.location.href = "login.html";

    } catch (err) {
      console.error(err);
      alert(err.message || "Signup failed.");
    }
  });
}
