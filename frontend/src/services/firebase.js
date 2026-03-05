import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyA3Kv0IW0BLYwVkPLOWDHOq0Vka1ptXZiA",
    authDomain: "swaply-e8708.firebaseapp.com",
    projectId: "swaply-e8708",
    storageBucket: "swaply-e8708.firebasestorage.app",
    messagingSenderId: "431430511657",
    appId: "1:431430511657:web:cfdc839f9cc41d5443c038",
    measurementId: "G-NJYN2GV1XC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
