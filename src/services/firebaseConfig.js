// services/firebaseConfig.js

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "bookrentalapp-2cae7.firebaseapp.com",
  projectId: "bookrentalapp-2cae7",
  storageBucket: "bookrentalapp-2cae7.firebasestorage.app",
  messagingSenderId: "387858183863",
  appId: "1:387858183863:web:e3a0af00be8fd517207f32",
  measurementId: "G-PGZZF8GB67",
};

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp(firebaseConfig);

let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  auth = getAuth(app);
}

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
