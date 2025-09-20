import { auth, db, storage } from './firebase-init.js'
import { $, show, hide, toast } from './router.js'
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'
import { ref as sRef, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js'

let pickedFile = null

export function bindComposer(){
  $('#pickVideo').onclick = ()=> $('#videoInput').click()
  $('#videoInput').addEventListener('change', (e)=>{
    pickedFile = e.target.files?.[0] || null
    $('#videoName').textContent = pickedFile ? `${pickedFile.name} (${Math.round(pickedFile.size/1024/1024)}MB)` : ''
  })

  $('#postBtn').onclick = onPost
}

async function captureThumb(file){
  return new Promise((resolve)=>{
    const url = URL.createObjectURL(file)
    const v = document.createElement('video'); v.src = url; v.muted = true; v.playsInline = true
    v.addEventListener('loadeddata', ()=>{
      const c = document.createElement('canvas'); c.width = 640; c.height = 360
      const ctx = c.getContext('2d'); ctx.drawImage(v,0,0,c.width,c.height)
      c.toBlob(b=>{ resolve(b) }, 'image/jpeg', 0.8)
      URL.revokeObjectURL(url)
    })
  })
}

async function onPost(){
  const u = auth.currentUser; if(!u) return toast('Masuk dulu')
  const text = $('#composerText').value.trim()
  if(!text && !pickedFile) return toast('Tulis status atau pilih video')

  try{
    const uref = doc(db,'users',u.uid); const usnap = await getDoc(uref); const udata = usnap.data()||{}
    const alias = udata.activeAlias || u.displayName || u.email

    let videoURL = '', thumbURL = '', mime = ''
    if(pickedFile){
      mime = pickedFile.type
      const postId = crypto.randomUUID()
      const vref = sRef(storage, `videos/${u.uid}/${postId}`)
      await uploadBytesResumable(vref, pickedFile)
      videoURL = await getDownloadURL(vref)
      const tb = await captureThumb(pickedFile)
      if(tb){
        const tref = sRef(storage, `thumbs/${u.uid}/${postId}.jpg`)
        await uploadBytesResumable(tref, tb)
        thumbURL = await getDownloadURL(tref)
      }
    }

    await addDoc(collection(db,'posts'),{
      uid:u.uid, author:alias, text, videoURL, thumbURL, mime,
      createdAt: serverTimestamp(), type: pickedFile? 'reel':'status'
    })

    $('#composerText').value = ''
    pickedFile = null; $('#videoInput').value = ''; $('#videoName').textContent=''
    toast('Terkirim')
  }catch(err){ console.error(err); toast(err.message) }
}

export function startFeeds(){
  const feedWrap = $('#feed'), reelsWrap = $('#reels'), myPostsWrap = $('#myPosts')
  const qFeed = query(collection(db,'posts'), orderBy('createdAt','desc'))

  const postCard = (p)=>{
    const time = p.createdAt?.toDate?.() ? p.createdAt.toDate() : new Date()
    const timeStr = new Intl.DateTimeFormat('id-ID',{ dateStyle:'medium', timeStyle:'short' }).format(time)
    const el = document.createElement('article')
    el.className = 'rounded-2xl border border-white/10 bg-white/5'
    el.innerHTML = `
      <div class="p-4 flex gap-3">
        <img class="w-10 h-10 rounded-full bg-slate-700"/>
        <div class="flex-1">
          <div class="font-semibold">${p.author||'Anon'}</div>
          <div class="text-xs text-slate-400">${timeStr}</div>
          <div class="mt-2 whitespace-pre-wrap">${(p.text||'')}</div>
        </div>
      </div>
      ${p.videoURL? `<div class="bg-black"><video src="${p.videoURL}" controls playsinline class="w-full"></video></div>`: ''}
    `
    return el
  }

  const reelCard = (p)=>{
    const el = document.createElement('article')
    el.className = 'rounded-2xl border border-white/10 bg-white/5 overflow-hidden'
    el.innerHTML = `
      <div class="p-3">
        <div class="font-semibold">${p.author||'Anon'}</div>
        <div class="text-xs text-slate-400">Reel</div>
      </div>
      <div class="bg-black">
        <video src="${p.videoURL}" controls playsinline class="w-full"></video>
      </div>`
    return el
  }

  onSnapshot(qFeed, (snap)=>{
    feedWrap.innerHTML = ''
    reelsWrap.innerHTML = ''
    myPostsWrap.innerHTML = ''
    const u = auth.currentUser
    snap.forEach(docSnap=>{
      const p = { id:docSnap.id, ...docSnap.data() }
      feedWrap.appendChild(postCard(p))
      if(p.videoURL) reelsWrap.appendChild(reelCard(p))
      if(u && p.uid===u.uid) myPostsWrap.appendChild(postCard(p))
    })
  })
}
