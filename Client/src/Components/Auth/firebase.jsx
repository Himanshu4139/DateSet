// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyArQNqWkUcZtEB38lVvz7LzG0WuagTjBjM",
  authDomain: "fir-authh001.firebaseapp.com",
  projectId: "fir-authh001",
  storageBucket: "fir-authh001.firebasestorage.app",
  messagingSenderId: "110692957973",
  appId: "1:110692957973:web:872cdc5a398a16ef93731c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export {auth,provider}