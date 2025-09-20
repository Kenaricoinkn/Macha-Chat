import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'
import {
  getFirestore, collection, addDoc, serverTimestamp,
  query, orderBy, onSnapshot, doc, getDoc, deleteDoc
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'

/* === pakai config milikmu === */
const firebaseConfig = {
  apiKey: "AIzaSyDIsTmg0_-rcz9tH3U-_sZuWk7sUOLgMSw",
  authDomain: "macha-chat.firebaseapp.com",
  projectId: "macha-chat",
  storageBucket: "macha-chat.appspot.com",
  messagingSenderId: "576142384286",
  appId: "1:576142384286:web:cfed000ac8a50b662a6f8f",
  measurementId: "G-6ZMFHMZVEK"
};
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db   = getFirestore(app)

/* === helpers === */
const $ = s => document.querySelector(s)
const toast = (msg)=>{
  const t = $('#toast')
  t.innerHTML = `<div class="px-4 py-2 rounded-xl bg-white text-slate-900 shadow">${msg}</div>`
  t.classList.remove('hidden'); setTimeout(()=>t.classList.add('hidden'), 2000)
}

/* === guard & header === */
onAuthStateChanged(auth, async (user)=>{
  if(!user){ window.location.replace('./index.html'); return }
  // avatar + name
  const name = user.displayName || user.email || 'Pengguna'
  $('#meAvatar').src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`
  // logout
  $('#logoutBtn').addEventListener('click', async ()=>{
    await signOut(auth); window.location.replace('./index.html')
  })
  // stories dummy
  renderStories(name)
  // composer
  bindComposer(user)
  // feed
  startFeed(user)
})

/* === stories (dummy dulu) === */
function storyItem(label){
  const el = document.createElement('div')
  el.className = 'w-28 overflow-hidden rounded-2xl border border-white/10 bg-slate-800 flex-shrink-0'
  el.innerHTML = `
    <div class="h-36 bg-black/60 grid place-items-center">🎬</div>
    <div class="p-2 text-xs truncate">${label}</div>
  `
  return el
}
function renderStories(name){
  const s = $('#stories'); s.innerHTML = ''
  s.appendChild(storyItem('Buat cerita'))
  s.appendChild(storyItem(name))
  s.appendChild(storyItem('Teman A'))
  s.appendChild(storyItem('Teman B'))
  s.appendChild(storyItem('Teman C'))
}

/* === composer === */
function bindComposer(user){
  $('#postBtn').addEventListener('click', async ()=>{
    const text = $('#composer').value.trim()
    if(!text) return toast('Tulis sesuatu dulu')
    try{
      let displayName = user.displayName || user.email || 'Pengguna'
      // coba ambil nama dari koleksi users (kalau ada)
      try{
        const us = await getDoc(doc(db,'users',user.uid))
        if(us.exists() && us.data().name) displayName = us.data().name
      }catch{}
      await addDoc(collection(db,'posts'), {
        uid: user.uid,
        author: displayName,
        text,
        createdAt: serverTimestamp(),
        type: 'status'
      })
      $('#composer').value = ''
      toast('Terkirim')
    }catch(e){ console.error(e); toast(e.message) }
  })
}

/* === feed === */
function card(p, isOwner){
  const time = p.createdAt?.toDate?.() ? p.createdAt.toDate() : new Date()
  const timeStr = new Intl.DateTimeFormat('id-ID',{ dateStyle:'medium', timeStyle:'short' }).format(time)
  const el = document.createElement('article')
  el.className = 'rounded-2xl border border-white/10 bg-white/5'
  el.innerHTML = `
    <div class="p-3 sm:p-4">
      <div class="flex gap-3">
        <img class="w-10 h-10 rounded-full bg-slate-700">
        <div class="flex-1">
          <div class="font-semibold">${p.author||'Anon'}</div>
          <div class="text-xs text-slate-400">${timeStr}</div>
        </div>
        ${isOwner ? `<button data-del="${p.id}" class="text-slate-300 hover:text-red-300">Hapus</button>`:''}
      </div>
      ${p.text ? `<div class="mt-3 whitespace-pre-wrap">${p.text}</div>` : ''}
      <div class="mt-3 flex gap-2">
        <button class="px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-sm opacity-60" title="Segera hadir">Suka</button>
        <button class="px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-sm opacity-60" title="Segera hadir">Komentar</button>
      </div>
    </div>
  `
  if(isOwner){
    el.querySelector('[data-del]')?.addEventListener('click', async ()=>{
      try{ await deleteDoc(doc(db,'posts',p.id)); toast('Dihapus') }catch(e){ toast(e.message) }
    })
  }
  return el
}

function startFeed(user){
  const feed = $('#feed')
  const qFeed = query(collection(db,'posts'), orderBy('createdAt','desc'))
  onSnapshot(qFeed, snap=>{
    feed.innerHTML = ''
    snap.forEach(d=>{
      const p = { id:d.id, ...d.data() }
      feed.appendChild( card(p, user && p.uid===user.uid) )
    })
  })
}
