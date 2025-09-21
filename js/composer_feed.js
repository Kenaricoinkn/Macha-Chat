import {
  getFirestore, collection, addDoc, serverTimestamp,
  query, orderBy, onSnapshot, doc, getDoc, deleteDoc
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'

/* === init === */
const auth = getAuth()
const db   = getFirestore()

/* === helpers === */
const $ = s => document.querySelector(s)
const toast = (msg)=>{
  const t = $('#toast')
  t.innerHTML = `<div class="px-4 py-2 rounded-xl bg-white text-slate-900 shadow">${msg}</div>`
  t.classList.remove('hidden'); setTimeout(()=>t.classList.add('hidden'), 2000)
}

/* === Hemat kuota Cloudinary === */
function cldTransform(url, opts = 'w_600,q_auto,f_auto') {
  if (!url || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/${opts}/`)
}
function cldThumb(url) {
  return cldTransform(url, 'w_120,h_120,c_fill,q_auto,f_auto')
}

/* === composer === */
export function bindComposer(user){
  $('#postBtn').addEventListener('click', async ()=>{
    const text = $('#composer').value.trim()
    const photo = $('#photoFile').files[0]
    const video = $('#videoFile').files[0]
    if(!text && !photo && !video) return toast('Isi teks atau pilih file dulu')

    try{
      let displayName = user.displayName || user.email || 'Pengguna'
      try{
        const us = await getDoc(doc(db,'users',user.uid))
        if(us.exists() && us.data().name) displayName = us.data().name
      }catch{}

      let imageURL='', videoURL=''
      // upload foto/video ke Cloudinary lewat API Vercel
      if(photo){
        const fd = new FormData()
        fd.append('file', photo)
        const sigRes = await fetch('/api/cloudinary').then(r=>r.json())
        Object.entries(sigRes).forEach(([k,v])=>fd.append(k,v))
        const up = await fetch(`https://api.cloudinary.com/v1_1/${sigRes.cloud_name}/image/upload`,{ method:'POST', body:fd })
        const json = await up.json(); imageURL = json.secure_url
      }
      if(video){
        const fd = new FormData()
        fd.append('file', video)
        const sigRes = await fetch('/api/cloudinary').then(r=>r.json())
        Object.entries(sigRes).forEach(([k,v])=>fd.append(k,v))
        const up = await fetch(`https://api.cloudinary.com/v1_1/${sigRes.cloud_name}/video/upload`,{ method:'POST', body:fd })
        const json = await up.json(); videoURL = json.secure_url
      }

      await addDoc(collection(db,'posts'), {
        uid: user.uid,
        author: displayName,
        text,
        imageURL,
        videoURL,
        createdAt: serverTimestamp(),
      })
      $('#composer').value = ''
      $('#photoFile').value = ''
      $('#videoFile').value = ''
      toast('Terkirim')
    }catch(e){ console.error(e); toast(e.message) }
  })
}

/* === feed card === */
function postCard(p, isOwner, user){
  const time = p.createdAt?.toDate?.() ? p.createdAt.toDate() : new Date()
  const timeStr = new Intl.DateTimeFormat('id-ID',{ dateStyle:'medium', timeStyle:'short' }).format(time)
  const el = document.createElement('article')
  el.className = 'rounded-2xl border border-white/10 bg-white/5 mb-4 overflow-hidden'

  // media hemat kuota
  let media = ''
  if (p.imageURL) {
    const imgURL = cldTransform(p.imageURL, 'w_600,q_auto,f_auto')
    media += `<img src="${imgURL}" loading="lazy"
                   class="w-full max-h-[70vh] object-contain bg-black/30">`
  }
  if (p.videoURL) {
    const vidURL = cldTransform(p.videoURL, 'w_640,q_auto,f_auto')
    media += `<video src="${vidURL}" controls preload="metadata" playsinline
                   class="w-full bg-black rounded-2xl"></video>`
  }

  el.innerHTML = `
    <div class="p-3 sm:p-4">
      <div class="flex gap-3">
        <img class="w-10 h-10 rounded-full bg-slate-700" src="https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(p.author||'Anon')}">
        <div class="flex-1">
          <div class="font-semibold">${p.author||'Anon'}</div>
          <div class="text-xs text-slate-400">${timeStr}</div>
        </div>
        ${isOwner ? `<button data-del="${p.id}" class="text-slate-300 hover:text-red-300">Hapus</button>`:''}
      </div>
      ${p.text ? `<div class="mt-3 whitespace-pre-wrap">${p.text}</div>` : ''}
      ${media ? `<div class="mt-3">${media}</div>` : ''}
      <div class="mt-3 flex gap-2">
        <button class="px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-sm opacity-70" title="Segera hadir">👍 Suka</button>
        <button class="px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-sm opacity-70" title="Segera hadir">💬 Komentar</button>
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

/* === feed stream === */
export function startFeed(user){
  const feed = $('#feed')
  const qFeed = query(collection(db,'posts'), orderBy('createdAt','desc'))
  onSnapshot(qFeed, snap=>{
    feed.innerHTML = ''
    snap.forEach(d=>{
      const p = { id:d.id, ...d.data() }
      feed.appendChild( postCard(p, user && p.uid===user.uid, user) )
    })
  })
}
