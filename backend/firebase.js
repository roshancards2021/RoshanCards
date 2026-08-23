// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDntPai4a_NT8P3a4clJOr6Yud3nQWJ9d4",
  authDomain: "roshancards-a837a.firebaseapp.com",
  projectId: "roshancards-a837a",
  storageBucket: "roshancards-a837a.firebasestorage.app",
  messagingSenderId: "879430233643",
  appId: "1:879430233643:web:1073b8df68bf36b961046e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };