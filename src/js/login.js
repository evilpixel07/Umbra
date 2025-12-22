import { auth, db } from "./config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const otpSection = document.getElementById("otp-section");
    const preOtpDiv = document.getElementById("pre-otp");
    const otpEntryDiv = document.getElementById("otp-entry");
    const generateBtn = document.getElementById("generate-otp");
    const verifyBtn = document.getElementById("verify-otp");
    const resendLink = document.getElementById("resend-otp");
    const otpInput = document.getElementById("otp-input");
    const timerDisplay = document.getElementById("timer");

    let currentUser = null;
    let timerInterval = null;

    if (!loginForm) return;

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            currentUser = userCred.user;
            console.log("Credentials valid for:", currentUser.uid);

            loginForm.classList.add("hidden");
            otpSection.classList.remove("hidden");
            document.getElementById("loginTitle").textContent = "Verify It's You";

        } catch (err) {
            console.error("Login error:", err);
            alert("Login failed: " + err.message);
        }
    });

    generateBtn.addEventListener("click", async () => {
        if (!currentUser) return;
        generateBtn.disabled = true;
        generateBtn.textContent = "Sending...";

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 3 * 60 * 1000;

        try {
            // Attempt to save to Firestore first
            console.log("Saving OTP to Firestore...");
            await setDoc(doc(db, "otp_codes", currentUser.uid), {
                code: otpCode,
                email: currentUser.email,
                expiresAt: expiresAt
            });
            console.log("OTP saved to Firestore successfully.");

            
            console.log("Sending email via EmailJS...");

            // Fallback to input field if currentUser.email is somehow missing
            const emailToSend = currentUser.email || document.getElementById("email").value.trim();
            console.log("Email to send to:", emailToSend);

            if (!emailToSend) {
                throw new Error("No email address found to send OTP to.");
            }

            const templateParams = {
                to_email: emailToSend,
                passcode: otpCode,
                time: new Date(expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            console.log("Template Params:", templateParams);

            
            if (typeof emailjs === 'undefined') {
                throw new Error("EmailJS SDK not loaded.");
            }

            await emailjs.send('evil_pixel_07', 'template_bbtzb5y', templateParams);
            console.log("OTP Email sent successfully to:", currentUser.email);

            preOtpDiv.classList.add("hidden");
            otpEntryDiv.classList.remove("hidden");
            startTimer(expiresAt);

        } catch (err) {
            console.error("OTP Error:", err);
            
            let errorMessage = err.message || "Unknown error";
            if (err.text) errorMessage += " (" + err.text + ")";

            alert("Failed to generate OTP: " + errorMessage);

            generateBtn.disabled = false;
            generateBtn.textContent = "Generate OTP";
        }
    });

    verifyBtn.addEventListener("click", async () => {
        const inputCode = otpInput.value.trim();
        if (inputCode.length !== 6) return alert("Please enter a 6-digit code.");

        verifyBtn.disabled = true;
        verifyBtn.textContent = "Verifying...";

        try {
            const docRef = doc(db, "otp_codes", currentUser.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const now = Date.now();

                if (now > data.expiresAt) {
                    alert("OTP has expired. Please resend.");
                    resetOTPView();
                } else if (data.code === inputCode) {
                    alert("Login Successful!");
                    window.location.href = "notes.html";
                } else {
                    alert("Invalid Code. Please try again.");
                    verifyBtn.disabled = false;
                    verifyBtn.textContent = "Verify & Login";
                }
            } else {
                alert("No OTP found. Please generate a new one.");
                resetOTPView();
            }
        } catch (err) {
            console.error(err);
            alert("Verification failed.");
            verifyBtn.disabled = false;
            verifyBtn.textContent = "Verify & Login";
        }
    });

    resendLink.addEventListener("click", (e) => {
        e.preventDefault();
        resetOTPView();
    });

    function startTimer(expiryTime) {
        clearInterval(timerInterval);

        function update() {
            const now = Date.now();
            const diff = expiryTime - now;

            if (diff <= 0) {
                clearInterval(timerInterval);
                timerDisplay.textContent = "Code Expired";
                timerDisplay.style.color = "#ef4444";
                return;
            }

            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            timerDisplay.textContent = `Expires in ${minutes}:${seconds.toString().padStart(2, '0')}`;
            timerDisplay.style.color = "#64748b";
        }

        update();
        timerInterval = setInterval(update, 1000);
    }

    function resetOTPView() {
        clearInterval(timerInterval);
        otpEntryDiv.classList.add("hidden");
        preOtpDiv.classList.remove("hidden");
        generateBtn.disabled = false;
        generateBtn.textContent = "Generate OTP";
        verifyBtn.disabled = false;
        verifyBtn.textContent = "Verify & Login";
        otpInput.value = "";
    }
});
