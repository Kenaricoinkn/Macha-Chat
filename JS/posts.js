import { auth, db } from './firebase-init.js'
import { $, toast } from './router.js'
import {
  collection, addDoc, serverTimestamp,
  query, orderBy, onSnapshot, doc, getDoc
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'

export function bindComposer(){
  $('#postBtn').onclick = onPost
}

async function onPost(){
  const u = auth.currentUser; if(!u) return toast('Masuk dulu')
  const text = $('#composerText').value.trim()
  const videoURL = ($('#videoUrl')?.value || '').trim()

  if(!text && !videoURL) return toast('Tulis status atau isi URL video')

  try{
    const uref = doc(db,'users',u.uid)
    const usnap = await getDoc(uref)
    const udata = usnap.data()||{}
    const alias = udata.activeAlias || u.displayName || u.email || 'Pengguna'

    await addDoc(collection(db,'posts'), {
      uid: u.uid,
      author: alias,
      text,
      videoURL,
      createdAt: serverTimestamp(),
      type: videoURL ? 'reel' : 'status'
    })

    $('#composerText').value = ''
    if($('#videoUrl')) $('#videoUrl').value = ''
    toast('Terkirim')
  }catch(err){
    console.error(err)
    toast(err.message)
  }
}

export function startFeeds(){
  const feedWrap = $('#feed'), reelsWrap = $('#reels'), myPostsWrap = $('#myPosts')
  const qFeed = query(collection(db,'posts'), orderBy('createdAt','desc'))

  const videoElement = (src)=>{
    const yt = src.match(/^https?:\\/\\/(www\\.)?youtube\\.com\\/watch\\?v=([A-Za-z0-9_\\-]+)/) ||
               src.match(/^https?:\\/\\/youtu\\.be\\/([A-Za-z0-9_\\-]+)/)
    if(yt){
      const id = yt[2] || yt[1]
      return `<div class="aspect-video bg-black">
                <iframe src="https://www.youtube.com/embed/${id}" class="w-full h-full" allowfullscreen loading="lazy"></iframe>
              </div>`
    }
    return `<div class="bg-black"><video src="${src}" controls playsinline class="w-full"></video></div>`
  }

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
          ${p.text ? `<div class="mt-2 whitespace-pre-wrap">${p.text}</div>` : ''}
        </div>
      </div>
      ${p.videoURL ? videoElement(p.videoURL) : ''}
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
      ${videoElement(p.videoURL)}
    `
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
