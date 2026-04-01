import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// 1. Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCmw3Za_l18_lr1cS-_JOplnonA_GGVC74",
    authDomain: "school-of-rupanugas.firebaseapp.com",
    projectId: "school-of-rupanugas",
    storageBucket: "school-of-rupanugas.firebasestorage.app",
    messagingSenderId: "777590722417",
    appId: "1:777590722417:web:5359efd5070346e613f0d0",
    measurementId: "G-100BETFPGK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 2. UI Elements
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const mainSubmitBtn = document.getElementById('main-submit');
const toggleLoginBtn = document.getElementById('toggle-login');
const toggleSignupBtn = document.getElementById('toggle-signup');
const authForm = document.getElementById('auth-form');

// 3. Helper: Generate/Retrieve a Unique Browser ID (Device Binding)
const getBrowserId = () => {
    let id = localStorage.getItem('mvp_device_token');
    if (!id) {
        id = 'device_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('mvp_device_token', id);
    }
    return id;
};

// 4. Toggle UI Logic
let isLogin = true;

const updateUI = () => {
    if (isLogin) {
        authTitle.textContent = 'Welcome Back';
        authSubtitle.textContent = 'Access your learning dashboard';
        mainSubmitBtn.textContent = 'Continue to Course';
        toggleLoginBtn.classList.add('active');
        toggleSignupBtn.classList.remove('active');
    } else {
        authTitle.textContent = 'Create Account';
        authSubtitle.textContent = 'Start your learning journey today';
        mainSubmitBtn.textContent = 'Sign Up';
        toggleSignupBtn.classList.add('active');
        toggleLoginBtn.classList.remove('active');
    }
};

toggleLoginBtn.addEventListener('click', () => { isLogin = true; updateUI(); });
toggleSignupBtn.addEventListener('click', () => { isLogin = false; updateUI(); });

// 5. Form Submission Logic
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const currentDevice = getBrowserId();

    try {
        if (!isLogin) {
            // --- SIGNUP LOGIC ---
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Save the device ID to Firestore to "lock" the account
            await setDoc(doc(db, "users", user.uid), {
                email: email,
                boundDevice: currentDevice,
                createdAt: new Date().toISOString()
            });

            alert("Account created and bound to this browser!");
            window.location.href = "dashboard.html";

        } else {
            // --- LOGIN LOGIC ---
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (userDoc.exists()) {
                const userData = userDoc.data();

                // Check if the current browser ID matches the one saved during signup
                if (userData.boundDevice === currentDevice) {
                    alert("Login Successful!");
                    window.location.href = "dashboard.html";
                } else {
                    alert("Unauthorized device! You can only access this account from the device used during signup.");
                    await signOut(auth); 
                }
            } else {
                alert("User record not found in database.");
            }
        }
    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
    }
});