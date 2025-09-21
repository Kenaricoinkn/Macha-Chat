import { auth, db, storage, $, toast, relTime } from './config.js'
import {
  collection, addDoc, serverTimestamp, doc, getDoc, deleteDoc,
  setDoc, query, orderBy, onSnapshot, getCountFromServer
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'
import { ref, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js'

function setUploadProgress(pct){
  const bar = document.getElementById('uploadBar')
  const prog = document.getElementById('uploadProg')
  if(!bar || !prog) return
  bar.classList.remove('hidden'); prog.style.width = pct+'%'; if(pct>=100) setTimeout(()=>bar.classList.add('hidden'),600)
}
async function uploadTo(path, file){
  return new Promise((resolve,reject)=>{
    const r = ref(storage, path)
    const task = uploadBytesResumable(r, file)
    task.on('state_changed', s=>{
      setUploadProgress(Math.round(100*s.bytesTransferred/s.totalBytes))
    }, reject, async ()=>{
      resolve(await getDownloadURL(r))
    })
  })
}

/* -------- Composer -------- */
export function initComposer(user){
  const chipsRefresh = ()=>{
    const chips = $('#fileChips'); chips.innerHTML = ''
    const pf = $('#photoFile').files[0], vf = $('#videoFile').files[0]
    if(pf){ const c=document.createElement('span'); c.className='px-2 py-1 rounded-lg bg-slate-900/70 border border-white/10 text-xs'; c.textContent=pf.name; chips.appendChild(c) }
    if(vf){ const c=document.createElement('span'); c.className='px-2 py-1 rounded-lg bg-slate-900/70 border border-white/10 text-xs'; c.textContent=vf.name; chips.appendChild(c) }
  }
  $('#photoFile').addEventListener('change', chipsRefresh)
  $('#videoFile').addEventListener('change', chipsRefresh)

  $('#postBtn').addEventListener('click', async ()=>{
    const text  = $('#composer').value.trim()
    const photo = $('#photoFile').files[0]
    const video = $('#videoFile').files[0]
    if(!text && !photo && !video) return toast('Tulis sesuatu atau pilih media')

    try{
      let displayName = auth.currentUser.displayName || auth.currentUser.email || 'Pengguna'
      try{
        const us = await getDoc(doc(db,'users',auth.currentUser.uid))
        if(us.exists() && us.data().name) displayName = us.data().name
      }catch{}

      let imageURL='', videoURL=''
      if(photo){
        const ext = (photo.name.split('.').pop()||'jpg').toLowerCase()
        imageURL = await uploadTo(`images/${auth.currentUser.uid}/${Date.now()}.${ext}`, photo)
      }
      if(video){
        const ext = (video.name.split('.').pop()||'mp4').toLowerCase()
        videoURL = await uploadTo(`videos/${auth.currentUser.uid}/${Date.now()}.${ext}`, video)
      }

      await addDoc(collection(db,'posts'), {
        uid: auth.currentUser.uid, author: displayName, text,
        imageURL, videoURL, createdAt: serverTimestamp()
      })

      $('#composer').value = ''
      $('#photoFile').value = ''
      $('#videoFile').value = ''
      $('#fileChips').innerHTML = ''
      setUploadProgress(100)
      toast('Terkirim')
    }catch(e){ console.error(e); toast(e.message) }
  })
}

/* -------- Feed -------- */
function likeCount(postId){
  return getCountFromServer(collection(db, `posts/${postId}/likes`))
}

function postCard(p, isOwner, user){
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
        <button data-like="${p.id}" class="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-sm hover:bg-slate-900/80">
          👍 Suka <span data-like-count="${p.id}">0</span>
        </button>
        <button data-showcmt="${p.id}" class="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-sm hover:bg-slate-900/80">
          💬 Komentar
        </button>
      </div>

      <div id="cmt-${p.id}" class="hidden mt-3">
        <div class="flex gap-2">
          <input id="cmt-input-${p.id}" placeholder="Tulis komentar…"
                 class="flex-1 rounded-xl bg-slate-900/70 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/40">
          <button data-sendcmt="${p.id}" class="px-3 py-2 rounded-xl bg-brand text-white text-sm hover:opacity-90">Kirim</button>
        </div>
        <div id="cmt-list-${p.id}" class="mt-3 space-y-2 text-sm"></div>
      </div>
    </div>
  `

  if(isOwner){
    el.querySelector(`[data-del="${p.id}"]`)?.addEventListener('click', async ()=>{
      try{ await deleteDoc(doc(db,'posts',p.id)); toast('Dihapus') }catch(e){ toast(e.message) }
    })
  }

  // like toggle
  const myLikeRef = doc(db, `posts/${p.id}/likes/${user.uid}`)
  el.querySelector(`[data-like="${p.id}"]`)?.addEventListener('click', async ()=>{
    try{
      const s = await getDoc(myLikeRef)
      if(s.exists()) await deleteDoc(myLikeRef)
      else await setDoc(myLikeRef, { uid:user.uid, at: serverTimestamp() })
      const c = await likeCount(p.id)
      const elc = document.querySelector(`[data-like-count="${p.id}"]`)
      if(elc) elc.textContent = c.data().count || 0
    }catch(e){ toast(e.message) }
  })

  // komentar
  el.querySelector(`[data-showcmt="${p.id}"]`)?.addEventListener('click', ()=>{
    document.getElementById(`cmt-${p.id}`).classList.toggle('hidden')
  })
  el.querySelector(`[data-sendcmt="${p.id}"]`)?.addEventListener('click', async ()=>{
    const input = document.getElementById(`cmt-input-${p.id}`)
    const text = input.value.trim(); if(!text) return
    await addDoc(collection(db, `posts/${p.id}/comments`), {
      uid: user.uid, author: user.displayName||user.email||'Pengguna', text,
      createdAt: serverTimestamp()
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

  // set jumlah like awal
  likeCount(p.id).then(s=>{
    const elc = document.querySelector(`[data-like-count="${p.id}"]`)
    if(elc) elc.textContent = s.data().count || 0
  })

  return el
}

export function startFeed(user){
  const feed = $('#feed')
  const q = query(collection(db,'posts'), orderBy('createdAt','desc'))
  onSnapshot(q, (snap)=>{
    feed.innerHTML = ''
    snap.forEach(d=>{
      const p = { id:d.id, ...d.data() }
      feed.appendChild( postCard(p, user && p.uid===user.uid, user) )
    })
  })
}

/* stories dummy (biar tak error) */
export function renderStories(name){
  const s = $('#stories'); s.innerHTML = ''
  const item = (label)=>{
    const el = document.createElement('div')
    el.className = 'w-28 overflow-hidden rounded-2xl border border-white/10 bg-slate-800 flex-shrink-0'
    el.innerHTML = `<div class="h-36 bg-black/60 grid place-items-center">🎬</div>
                    <div class="p-2 text-xs truncate">${label}</div>`
    return el
  }
  s.appendChild(item('Buat cerita'))
  s.appendChild(item(name||'Kamu'))
  s.appendChild(item('Teman A'))
  s.appendChild(item('Teman B'))
}
