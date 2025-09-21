import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'

const firebaseConfig = {
  apiKey: "AIzaSyDIsTmg0_-rcz9tH3U-_sZuWk7sUOLgMSw",
  authDomain: "macha-chat.firebaseapp.com",
  projectId: "macha-chat",
  storageBucket: "macha-chat.appspot.com" // tak dipakai lagi utk upload (Cloudinary)
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db   = getFirestore(app)

export const $ = sel => document.querySelector(sel)
export const toast = (msg)=>{
  const t = $('#toast'); if(!t) return
  t.innerHTML = `<div class="px-4 py-2 rounded-xl bg-white text-slate-900 shadow">${msg}</div>`
  t.classList.remove('hidden'); setTimeout(()=>t.classList.add('hidden'), 2000)
}
export const relTime = (date)=>{
  const diff = (Date.now() - date.getTime())/1000
  if(diff < 60) return `${Math.floor(diff)} dtk`
  if(diff < 3600) return `${Math.floor(diff/60)} mnt`
  if(diff < 86400) return `${Math.floor(diff/3600)} jam`
  return new Intl.DateTimeFormat('id-ID',{ dateStyle:'medium', timeStyle:'short' }).format(date)
}
