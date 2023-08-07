// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAEH6c7uOF6gI7L8rYdFsPJrKunlTWG8_k",
  authDomain: "task-management-a1e70.firebaseapp.com",
  projectId: "task-management-a1e70",
  storageBucket: "task-management-a1e70.appspot.com",
  messagingSenderId: "284296078928",
  appId: "1:284296078928:web:6973d9df92a71f9a88d355",
  measurementId: "G-J7GW55XGZE"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
