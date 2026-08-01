import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  projectId: "gen-lang-client-0684462293",
  appId: "1:801483020700:web:2145efafb75333e0259059",
  apiKey: "AIzaSyAPxUmNPzAgRGNm7AeqR0hXpTilEguDlXs",
  authDomain: "gen-lang-client-0684462293.firebaseapp.com",
  storageBucket: "gen-lang-client-0684462293.firebasestorage.app",
  messagingSenderId: "801483020700",
  measurementId: "G-EQ2B8K7QRP",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
}, "ai-studio-taazabitespartne-31c9d739-6454-4c89-9e41-a585d0e10788");
export const storage = getStorage(app);
