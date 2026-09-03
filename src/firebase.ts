import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAhRPQ5hwbFlv-9aeXuG6q5Bgi_YSFziUw",
  authDomain: "clb-khoi-nghiep-market.firebaseapp.com",
  projectId: "clb-khoi-nghiep-market",
  storageBucket: "clb-khoi-nghiep-market.firebasestorage.app",
  messagingSenderId: "927009362619",
  appId: "1:927009362619:web:61324e8faa5c72dc880f9e"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
