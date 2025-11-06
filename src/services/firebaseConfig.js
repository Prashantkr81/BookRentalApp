// services/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyATxyoo6ORGoreYjeEiwVxRdql7T3u8n9Y",
  authDomain: "bookrentalapp-2cae7.firebaseapp.com",
  projectId: "bookrentalapp-2cae7",
  storageBucket: "bookrentalapp-2cae7.firebasestorage.app",
  messagingSenderId: "387858183863",
  appId: "1:387858183863:web:e3a0af00be8fd517207f32",
  measurementId: "G-PGZZF8GB67"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
