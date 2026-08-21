// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJAxxMgMxHJ2XIcbLviYMtbW4pVv6ZnJQ",
  authDomain: "roshancards-49a0c.firebaseapp.com",
  projectId: "roshancards-49a0c",
  storageBucket: "roshancards-49a0c.firebasestorage.app",
  messagingSenderId: "220290067919",
  appId: "1:220290067919:web:663b5e2ed95fe59fd0b6ba"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };