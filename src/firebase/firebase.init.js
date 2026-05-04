import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const s = (v) => (typeof v === "string" ? v.trim() : v);

const firebaseConfig = {
  apiKey: s(import.meta.env.VITE_apiKey),
  authDomain: s(import.meta.env.VITE_authDomain),
  projectId: s(import.meta.env.VITE_projectId),
  storageBucket: s(import.meta.env.VITE_storageBucket),
  messagingSenderId: s(import.meta.env.VITE_messagingSenderId),
  appId: s(import.meta.env.VITE_appId),
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
