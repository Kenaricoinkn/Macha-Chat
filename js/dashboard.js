import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'
import {
  getFirestore, collection, addDoc, serverTimestamp,
  query, orderBy, onSnapshot, doc, getDoc, deleteDoc,
  setDoc, getCountFromServer
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'
import {
  getStorage, ref, uploadBytesResumable, getDownloadURL
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js'

/* === Firebase config punyamu === */
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
const storage = getStorage(app)

/* === helpers === */
const $ = s => document.querySelector(s)
const toast = (msg)=>{
  const t = $('#toast')
  t.innerHTML = `<div class="px-4 py-2 rounded-xl bg-white text-slate-900 shadow">${msg}</div>`
  t.classList.remove('hidden'); setTimeout(()=>t.classList.add('hidden'), 2000)
}
const relTime = (date)=>{
  const diff = (Date.now() - date.getTime())/1000
  if(diff < 60) return `${Math.floor(diff)} dtk`
  if(diff < 3600) return `${Math.floor(diff/60)} mnt`
  if(diff < 86400) return `${Math.floor(diff/3600)} jam`
  return new Intl.DateTimeFormat('id-ID',{ dateStyle:'medium', timeStyle:'short' }).format(date)
}
async function uploadTo(path, file){
  return new Promise((resolve,reject)=>{
    const r = ref(storage, path)
    const task = uploadBytesResumable(r, file)
    task.on('state_changed', null, reject, async ()=>{
      resolve(await getDownloadURL(r))
    })
  })
}

/* === guard & header === */
onAuthStateChanged(auth, async (user)=>{
  if(!user){ window.location.replace('./index.html'); return }
  const name = user.displayName || user.email || 'Pengguna'
  $('#meAvatar').src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`
  $('#logoutBtn').addEventListener('click', async ()=>{
    await signOut(auth); window.location.replace('./index.html')
  })
  renderStories(name)
  bindComposer(user)
  startFeed(user)
})

/* === stories (dummy) === */
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
  // refresh chip saat pilih file
  const refreshChips = ()=>{
    const chips = $('#fileChips'); chips.innerHTML = ''
    const photo = $('#photoFile').files[0]
    const video = $('#videoFile').files[0]
    if(photo){
      const c = document.createElement('span')
      c.className = 'px-2 py-1 rounded-lg bg-slate-900/70 border border-white/10 text-xs'
      c.textContent = photo.name
      chips.appendChild(c)
    }
    if(video){
      const c = document.createElement('span')
      c.className = 'px-2 py-1 rounded-lg bg-slate-900/70 border border-white/10 text-xs'
      c.textContent = video.name
      chips.appendChild(c)
    }
  }
  $('#photoFile').addEventListener('change', refreshChips)
  $('#videoFile').addEventListener('change', refreshChips)

  $('#postBtn').addEventListener('click', async ()=>{
    const text = $('#composer').value.trim()
    const photo = $('#photoFile').files[0]
    const video = $('#videoFile').files[0]
    if(!text && !photo && !video) return toast('Tulis sesuatu atau pilih media')

    try{
      let displayName = user.displayName || user.email || 'Pengguna'
      try{
        const us = await getDoc(doc(db,'users',user.uid))
        if(us.exists() && us.data().name) displayName = us.data().name
      }catch{}

      let imageURL = '', videoURL = ''
      if(photo){
        const ext = (photo.name.split('.').pop() || 'jpg').toLowerCase()
        imageURL = await uploadTo(`images/${user.uid}/${Date.now()}.${ext}`, photo)
      }
      if(video){
        const ext = (video.name.split('.').pop() || 'mp4').toLowerCase()
        videoURL = await uploadTo(`videos/${user.uid}/${Date.now()}.${ext}`, video)
      }

      await addDoc(collection(db,'posts'), {
        uid: user.uid, author: displayName, text,
        imageURL, videoURL,
        createdAt: serverTimestamp()
      })

      $('#composer').value = ''
      $('#photoFile').value = ''
      $('#videoFile').value = ''
      $('#fileChips').innerHTML = ''
      toast('Terkirim')
    }catch(e){ console.error(e); toast(e.message) }
  })
}

/* === feed === */
function card(p, isOwner, user){
  const time = p.createdAt?.toDate?.() ? p.createdAt.toDate() : new Date()
  const el = document.createElement('article')
  el.className = 'rounded-3xl border border-white/10 bg-slate-800/60 shadow-[0_10px_30px_rgba(0,0,0,.25)] overflow-hidden'

  let media = ''
  if(p.imageURL) media += `<img src="${p.imageURL}" class="w-full max-h-[70vh] object-contain bg-black/30">`
  if(p.videoURL) media += `<video src="${p.videoURL}" controls playsinline class="w-full bg-black"></video>`

  el.innerHTML = `
    <div class="p-4 sm:p-5">
      <div class="flex gap-3">
        <div class="w-10 h-10 rounded-full bg-slate-700"></div>
        <div class="flex-1">
          <div class="font-semibold leading-tight">${p.author||'Anon'}</div>
          <div class="text-xs text-slate-400">${relTime(time)}</div>
        </div>
        ${isOwner ? `<button data-del="${p.id}" class="px-2 py-1 rounded-lg text-slate-300 hover:text-red-300">Hapus</button>`:''}
      </div>

      ${p.text ? `<div class="mt-3 whitespace-pre-wrap leading-relaxed">${p.text}</div>` : ''}
      ${media ? `<div class="mt-3 overflow-hidden rounded-2xl border border-white/10">${media}</div>` : ''}

      <div class="mt-4 flex items-center gap-3">
        <button data-like="${p.id}"
                class="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-sm hover:bg-slate-900/80">
          👍 Suka <span data-like-count="${p.id}">0</span>
        </button>
        <button data-showcmt="${p.id}"
                class="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-sm hover:bg-slate-900/80">
          💬 Komentar
        </button>
      </div>

      <div id="cmt-${p.id}" class="hidden mt-3">
        <div class="flex gap-2">
          <input id="cmt-input-${p.id}"
                 placeholder="Tulis komentar…"
                 class="flex-1 rounded-xl bg-slate-900/70 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/40">
          <button data-sendcmt="${p.id}"
                  class="px-3 py-2 rounded-xl bg-brand text-white text-sm hover:opacity-90">
            Kirim
          </button>
        </div>
        <div id="cmt-list-${p.id}" class="mt-3 space-y-2 text-sm"></div>
      </div>
    </div>
  `

  // hapus post
  if(isOwner){
    el.querySelector(`[data-del="${p.id}"]`)?.addEventListener('click', async ()=>{
      try{ await deleteDoc(doc(db,'posts',p.id)); toast('Dihapus') }catch(e){ toast(e.message) }
    })
  }

  // like toggle
  const myLikeRef = doc(db, `posts/${p.id}/likes/${user.uid}`)
  el.querySelector(`[data-like="${p.id}"]`)?.addEventListener('click', async ()=>{
    try{
      const snap = await getDoc(myLikeRef)
      if(snap.exists()) await deleteDoc(myLikeRef)
      else await setDoc(myLikeRef, { uid:user.uid, at: serverTimestamp() })
      updateLikeCount(p.id)
    }catch(e){ toast(e.message) }
  })

  // komentar UI
  el.querySelector(`[data-showcmt="${p.id}"]`)?.addEventListener('click', ()=>{
    document.getElementById(`cmt-${p.id}`).classList.toggle('hidden')
  })
  el.querySelector(`[data-sendcmt="${p.id}"]`)?.addEventListener('click', async ()=>{
    const input = document.getElementById(`cmt-input-${p.id}`)
    const text = input.value.trim(); if(!text) return
    await addDoc(collection(db, `posts/${p.id}/comments`), {
      uid: user.uid, author: user.displayName||user.email||'Pengguna',
      text, createdAt: serverTimestamp()
    })
    input.value = ''
  })

  // live comments
  const qC = query(collection(db, `posts/${p.id}/comments`), orderBy('createdAt','asc'))
  onSnapshot(qC, (snap)=>{
    const wrap = document.getElementById(`cmt-list-${p.id}`)
    if(!wrap) return
    wrap.innerHTML = ''
    snap.forEach(d=>{
      const c = d.data()
      const li = document.createElement('div')
      li.className = 'rounded-xl bg-slate-900/50 border border-white/10 px-3 py-2'
      li.innerHTML = `<b>${c.author||'Anon'}</b><div class="text-slate-300">${c.text}</div>`
      wrap.appendChild(li)
    })
  })

  updateLikeCount(p.id)
  return el
}

async function updateLikeCount(postId){
  const snap = await getCountFromServer(collection(db, `posts/${postId}/likes`))
  const n = snap.data().count || 0
  const el = document.querySelector(`[data-like-count="${postId}"]`)
  if(el) el.textContent = n
}

function startFeed(user){
  const feed = $('#feed')
  const qFeed = query(collection(db,'posts'), orderBy('createdAt','desc'))
  onSnapshot(qFeed, snap=>{
    feed.innerHTML = ''
    snap.forEach(d=>{
      const p = { id:d.id, ...d.data() }
      feed.appendChild( card(p, user && p.uid===user.uid, user) )
    })
  })
}
