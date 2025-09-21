import { auth, db, $, toast, relTime } from './config.js'
import {
  collection, addDoc, serverTimestamp, doc, getDoc, deleteDoc,
  setDoc, query, orderBy, onSnapshot, getCountFromServer,
  getDocs, limit, startAfter
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'

/* === Cloudinary transform (hemat kuota) === */
const cld = (url, opt='w_600,q_auto,f_auto') =>
  url?.includes('/upload/') ? url.replace('/upload/', `/upload/${opt}/`) : url

/* === Upload helper === */
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
  return json.secure_url
}

/* === Composer === */
export function initComposer(user){
  const chips=()=>{ const c=$('#fileChips'); c.innerHTML=''; ['photoFile','videoFile'].forEach(id=>{
    const f=document.getElementById(id).files[0]; if(f){ const s=document.createElement('span'); s.className='px-2 py-1 rounded-lg bg-slate-900/70 border border-white/10'; s.textContent=f.name; c.appendChild(s) }
  }) }
  $('#photoFile').addEventListener('change', chips)
  $('#videoFile').addEventListener('change', chips)

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

      await addDoc(collection(db,'posts'), { uid:user.uid, author:displayName, text, imageURL, videoURL, createdAt:serverTimestamp() })
      $('#composer').value=''; $('#photoFile').value=''; $('#videoFile').value=''; $('#fileChips').innerHTML=''
      toast('Terkirim ✅')
    }catch(e){ toast(e.message) }
  })
}

/* === Card Post === */
function postCard(p, me){
  const time = p.createdAt?.toDate?.() ? p.createdAt.toDate() : new Date()
  const isOwner = me && p.uid===me.uid

  let media=''
  if(p.imageURL)  media += `<img src="${cld(p.imageURL,'w_600,q_auto,f_auto')}" loading="lazy" class="w-full max-h-[70vh] object-contain bg-black/30">`
  if(p.videoURL)  media += `<video src="${cld(p.videoURL,'w_640,q_auto,f_auto')}" controls preload="metadata" playsinline class="w-full bg-black rounded-2xl"></video>`

  const el=document.createElement('article')
  el.className='rounded-3xl border border-white/10 bg-slate-800/60 shadow-[0_10px_30px_rgba(0,0,0,.25)] overflow-hidden'
  el.innerHTML=`
    <div class="p-4 sm:p-5">
      <div class="flex gap-3">
        <div class="w-10 h-10 rounded-full bg-slate-700"></div>
        <div class="flex-1">
          <div class="font-semibold leading-tight">${p.author||'Anon'}</div>
          <div class="text-xs text-slate-400">${relTime(time)}</div>
        </div>
        ${isOwner?`<button data-del class="px-2 py-1 rounded-lg text-slate-300 hover:text-red-300">Hapus</button>`:''}
      </div>

      ${p.text?`<div class="mt-3 whitespace-pre-wrap leading-relaxed">${p.text}</div>`:''}
      ${media?`<div class="mt-3 overflow-hidden rounded-2xl border border-white/10">${media}</div>`:''}

      <div class="mt-4 flex items-center gap-3">
        <button data-like class="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-sm hover:bg-slate-900/80">
          👍 Suka <span data-like-count>0</span>
        </button>
        <button data-save class="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-sm hover:bg-slate-900/80">
          🔖 Simpan
        </button>
        <button data-showcmt class="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-sm hover:bg-slate-900/80">
          💬 Komentar
        </button>
      </div>

      <div data-cmtwrap class="hidden mt-3">
        <div class="flex gap-2">
          <input data-cmt-input placeholder="Tulis komentar…" class="flex-1 rounded-xl bg-slate-900/70 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/40">
          <button data-sendcmt class="px-3 py-2 rounded-xl bg-brand text-white text-sm hover:opacity-90">Kirim</button>
        </div>
        <div data-cmt-list class="mt-3 space-y-2 text-sm"></div>
      </div>
    </div>
  `

  /* hapus post */
  if(isOwner){
    el.querySelector('[data-del]')?.addEventListener('click', async()=>{
      try{ await deleteDoc(doc(db,'posts',p.id)); toast('Dihapus') }catch(e){ toast(e.message) }
    })
  }

  /* like */
  const likeBtn=el.querySelector('[data-like]'), likeCnt=el.querySelector('[data-like-count]')
  const myLikeRef = doc(db, `posts/${p.id}/likes/${me.uid}`)
  likeBtn?.addEventListener('click', async()=>{
    likeBtn.classList.add('opacity-50')
    const snap = await getDoc(myLikeRef)
    if(snap.exists()) await deleteDoc(myLikeRef)
    else await setDoc(myLikeRef, {uid:me.uid, at:serverTimestamp()})
    const cnt = await getCountFromServer(collection(db, `posts/${p.id}/likes`))
    likeCnt.textContent = cnt.data().count||0
    likeBtn.classList.remove('opacity-50')
  })
  getCountFromServer(collection(db, `posts/${p.id}/likes`)).then(s=>likeCnt.textContent=s.data().count||0)

  /* simpan / unsave */
  const saveBtn = el.querySelector('[data-save]')
  const saveRef = doc(db, `users/${me.uid}/saved/${p.id}`)
  saveBtn?.addEventListener('click', async ()=>{
    saveBtn.classList.add('opacity-50')
    const s = await getDoc(saveRef)
    if (s.exists()) { await deleteDoc(saveRef); toast('Dihapus dari tersimpan') }
    else { await setDoc(saveRef, {postId:p.id, savedAt:serverTimestamp()}); toast('Disimpan') }
    saveBtn.classList.remove('opacity-50')
  })

  /* komentar */
  const wrap=el.querySelector('[data-cmtwrap]')
  el.querySelector('[data-showcmt]')?.addEventListener('click', ()=>wrap.classList.toggle('hidden'))
  el.querySelector('[data-sendcmt]')?.addEventListener('click', async()=>{
    const input=el.querySelector('[data-cmt-input]')
    const text=input.value.trim(); if(!text) return
    await addDoc(collection(db, `posts/${p.id}/comments`), { uid:me.uid, author:me.displayName||me.email||'Pengguna', text, createdAt:serverTimestamp() })
    input.value=''
  })
  const listEl=el.querySelector('[data-cmt-list]')
  const qC=query(collection(db, `posts/${p.id}/comments`), orderBy('createdAt','asc'))
  onSnapshot(qC,(snap)=>{
    listEl.innerHTML=''; snap.forEach(d=>{
      const c=d.data()
      const li=document.createElement('div')
      li.className='rounded-xl bg-slate-900/50 border border-white/10 px-3 py-2'
      li.innerHTML=`<b>${c.author||'Anon'}</b><div class="text-slate-300">${c.text}</div>`
      listEl.appendChild(li)
    })
  })

  return el
}

/* === Pagination === */
let pageSize = 10, lastDocSnap = null, firstLoad = true

export async function startFeed(user){
  const feed=$('#feed'); const btn=$('#loadMore')
  const baseQ = query(collection(db,'posts'), orderBy('createdAt','desc'))

  async function load(init=false){
    btn.classList.add('hidden')
    if(init){ feed.innerHTML=''; lastDocSnap=null }
    let q = baseQ
    if(lastDocSnap) q = query(baseQ, startAfter(lastDocSnap), limit(pageSize))
    else q = query(baseQ, limit(pageSize))

    const snap = await getDocs(q)
    if(snap.docs.length===0){ if(firstLoad) feed.innerHTML='<div class="text-center text-slate-400">Belum ada postingan</div>'; return }
    lastDocSnap = snap.docs[snap.docs.length-1]
    snap.forEach(d=> feed.appendChild( postCard({id:d.id, ...d.data()}, user) ))
    if(snap.docs.length===pageSize) btn.classList.remove('hidden')
    firstLoad=false
  }

  btn.addEventListener('click', ()=>load(false))
  await load(true)

  // realtime untuk 1 post terbaru
  const liveQ = query(collection(db,'posts'), orderBy('createdAt','desc'), limit(1))
  onSnapshot(liveQ, (snap)=>{
    if(!snap.docs.length) return
    const d = snap.docs[0]
    if(!firstLoad){ 
      const node = postCard({id:d.id, ...d.data()}, user)
      feed.insertBefore(node, feed.firstChild)
    }
  })
}
