import { auth, db, $, toast, relTime } from './config.js'
import {
  collection, addDoc, serverTimestamp, doc, getDoc, deleteDoc,
  setDoc, query, orderBy, onSnapshot, getCountFromServer
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'

function setUploadProgress(pct){
  const bar = document.getElementById('uploadBar')
  const prog = document.getElementById('uploadProg')
  if(!bar||!prog) return; bar.classList.remove('hidden'); prog.style.width=pct+'%'; if(pct>=100) setTimeout(()=>bar.classList.add('hidden'),600)
}

async function uploadMediaCloudinary(file, folder){
  const sig = await fetch(`/api/cloudinary-sign?folder=${encodeURIComponent(folder)}`).then(r=>r.json())
  const form = new FormData()
  form.append('file', file)
  form.append('api_key', sig.api_key)
  form.append('timestamp', sig.timestamp)
  form.append('upload_preset', sig.upload_preset)
  if(sig.folder) form.append('folder', sig.folder)
  form.append('signature', sig.signature)

  const resp = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloud_name}/auto/upload`, { method:'POST', body:form })
  const json = await resp.json()
  if(!resp.ok) throw new Error(json.error?.message||'Upload gagal')
  setUploadProgress(100)
  return json.secure_url
}

/* -------- Composer -------- */
export function initComposer(user){
  const chipsRefresh=()=>{
    const chips=$('#fileChips'); chips.innerHTML=''
    const pf=$('#photoFile').files[0], vf=$('#videoFile').files[0]
    if(pf){ const c=document.createElement('span'); c.className='px-2 py-1 rounded-lg bg-slate-900/70 border border-white/10 text-xs'; c.textContent=pf.name; chips.appendChild(c) }
    if(vf){ const c=document.createElement('span'); c.className='px-2 py-1 rounded-lg bg-slate-900/70 border border-white/10 text-xs'; c.textContent=vf.name; chips.appendChild(c) }
  }
  $('#photoFile').addEventListener('change', chipsRefresh)
  $('#videoFile').addEventListener('change', chipsRefresh)

  $('#postBtn').addEventListener('click', async ()=>{
    const text=$('#composer').value.trim()
    const photo=$('#photoFile').files[0]
    const video=$('#videoFile').files[0]
    if(!text && !photo && !video) return toast('Tulis sesuatu atau pilih media')

    try{
      let displayName=user.displayName||user.email||'Pengguna'
      try{ const us=await getDoc(doc(db,'users',user.uid)); if(us.exists()&&us.data().name) displayName=us.data().name }catch{}

      let imageURL='', videoURL=''
      if(photo) imageURL = await uploadMediaCloudinary(photo, `images/${user.uid}`)
      if(video) videoURL = await uploadMediaCloudinary(video, `videos/${user.uid}`)

      await addDoc(collection(db,'posts'), {
        uid:user.uid, author:displayName, text, imageURL, videoURL, createdAt:serverTimestamp()
      })

      $('#composer').value=''; $('#photoFile').value=''; $('#videoFile').value=''; $('#fileChips').innerHTML=''
      setUploadProgress(100); toast('Terkirim')
    }catch(e){ toast(e.message) }
  })
}

/* -------- Feed -------- */
function postCard(p, isOwner, user){
  const time = p.createdAt?.toDate?.() ? p.createdAt.toDate() : new Date()
  const el=document.createElement('article')
  el.className='rounded-3xl border border-white/10 bg-slate-800/60 shadow-[0_10px_30px_rgba(0,0,0,.25)] overflow-hidden'

  let media=''
  if(p.imageURL) media+=`<img src="${p.imageURL}" class="w-full max-h-[70vh] object-contain bg-black/30">`
  if(p.videoURL) media+=`<video src="${p.videoURL}" controls playsinline class="w-full bg-black"></video>`

  el.innerHTML=`
    <div class="p-4 sm:p-5">
      <div class="flex gap-3">
        <div class="w-10 h-10 rounded-full bg-slate-700"></div>
        <div class="flex-1">
          <div class="font-semibold leading-tight">${p.author||'Anon'}</div>
          <div class="text-xs text-slate-400">${relTime(time)}</div>
        </div>
        ${isOwner?`<button data-del="${p.id}" class="px-2 py-1 rounded-lg text-slate-300 hover:text-red-300">Hapus</button>`:''}
      </div>
      ${p.text?`<div class="mt-3 whitespace-pre-wrap leading-relaxed">${p.text}</div>`:''}
      ${media?`<div class="mt-3 overflow-hidden rounded-2xl border border-white/10">${media}</div>`:''}
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
          <input id="cmt-input-${p.id}" placeholder="Tulis komentar…" class="flex-1 rounded-xl bg-slate-900/70 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/40">
          <button data-sendcmt="${p.id}" class="px-3 py-2 rounded-xl bg-brand text-white text-sm hover:opacity-90">Kirim</button>
        </div>
        <div id="cmt-list-${p.id}" class="mt-3 space-y-2 text-sm"></div>
      </div>
    </div>
  `

  if(isOwner){
    el.querySelector(`[data-del="${p.id}"]`)?.addEventListener('click', async()=>{
      try{ await deleteDoc(doc(db,'posts',p.id)); toast('Dihapus') }catch(e){ toast(e.message) }
    })
  }

  const myLikeRef = doc(db, `posts/${p.id}/likes/${user.uid}`)
  el.querySelector(`[data-like="${p.id}"]`)?.addEventListener('click', async()=>{
    const snap = await getDoc(myLikeRef)
    if(snap.exists()) await deleteDoc(myLikeRef)
    else await setDoc(myLikeRef, {uid:user.uid, at:serverTimestamp()})
    const cnt = await getCountFromServer(collection(db, `posts/${p.id}/likes`))
    const elc=document.querySelector(`[data-like-count="${p.id}"]`); if(elc) elc.textContent=cnt.data().count||0
  })

  el.querySelector(`[data-showcmt="${p.id}"]`)?.addEventListener('click', ()=>{
    document.getElementById(`cmt-${p.id}`).classList.toggle('hidden')
  })
  el.querySelector(`[data-sendcmt="${p.id}"]`)?.addEventListener('click', async()=>{
    const input=document.getElementById(`cmt-input-${p.id}`)
    const text=input.value.trim(); if(!text) return
    await addDoc(collection(db, `posts/${p.id}/comments`), { uid:user.uid, author:user.displayName||user.email||'Pengguna', text, createdAt:serverTimestamp() })
    input.value=''
  })

  const qC=query(collection(db, `posts/${p.id}/comments`), orderBy('createdAt','asc'))
  onSnapshot(qC,(snap)=>{
    const wrap=document.getElementById(`cmt-list-${p.id}`); if(!wrap) return
    wrap.innerHTML=''; snap.forEach(d=>{
      const c=d.data(); const li=document.createElement('div')
      li.className='rounded-xl bg-slate-900/50 border border-white/10 px-3 py-2'
      li.innerHTML=`<b>${c.author||'Anon'}</b><div class="text-slate-300">${c.text}</div>`
      wrap.appendChild(li)
    })
  })

  getCountFromServer(collection(db, `posts/${p.id}/likes`)).then(s=>{
    const elc=document.querySelector(`[data-like-count="${p.id}"]`); if(elc) elc.textContent=s.data().count||0
  })

  return el
}

export function startFeed(user){
  const feed=$('#feed')
  const q=query(collection(db,'posts'), orderBy('createdAt','desc'))
  onSnapshot(q,(snap)=>{
    feed.innerHTML=''
    snap.forEach(d=>{
      const p={id:d.id, ...d.data()}
      feed.appendChild( postCard(p, user && p.uid===user.uid, user) )
    })
  })
}

export function renderStories(name){
  const s=$('#stories'); s.innerHTML=''
  const item=(label)=>{ const el=document.createElement('div'); el.className='w-28 overflow-hidden rounded-2xl border border-white/10 bg-slate-800 flex-shrink-0'; el.innerHTML=`<div class="h-36 bg-black/60 grid place-items-center">🎬</div><div class="p-2 text-xs truncate">${label}</div>`; return el }
  s.appendChild(item('Buat cerita')); s.appendChild(item(name||'Kamu')); s.appendChild(item('Teman A')); s.appendChild(item('Teman B'))
}
