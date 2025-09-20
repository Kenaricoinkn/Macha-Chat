// Firebase v10 modular
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js'

// TODO: ganti dengan config proyek kamu
const firebaseConfig = {
  apiKey: "AIzaSyDIsTmg0_-rcz9tH3U-_sZuWk7sUOLgMSw",
  authDomain: "macha-chat.firebaseapp.com",
  projectId: "macha-chat",
  storageBucket: "macha-chat.firebasestorage.app",
  messagingSenderId: "576142384286",
  appId: "1:576142384286:web:cfed000ac8a50b662a6f8f",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
