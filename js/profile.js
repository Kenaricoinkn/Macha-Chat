import { app, auth, db } from './config.js'
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'
import { collection, query, where, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'

const cld = (u,opt='w_600,q_auto,f_auto')=>u?.includes('/upload/')?u.replace('/upload/',`/upload/${opt}/`):u

onAuthStateChanged(auth, user=>{
  if(!user){ location.replace('./index.html'); return }
  document.getElementById('name').textContent = user.displayName || user.email
  document.getElementById('email').textContent = user.email || ''
  document.getElementById('avatar').src = (user.photoURL && user.photoURL.includes('/upload/'))
    ? cld(user.photoURL,'w_120,h_120,c_fill,q_auto,f_auto') 
    : (user.photoURL || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.email)}`)

  const list = document.getElementById('myPosts')
  const q = query(collection(db,'posts'), where('uid','==',user.uid), orderBy('createdAt','desc'))
  onSnapshot(q, snap=>{
    list.innerHTML=''
    snap.forEach(d=>{
      const p=d.data()
      const media = p.imageURL ? `<img src="${cld(p.imageURL)}" class="w-full rounded-2xl">`
                 : p.videoURL ? `<video src="${cld(p.videoURL,'w_640,q_auto,f_auto')}" controls preload="metadata" class="w-full rounded-2xl bg-black"></video>` : ''
      const el=document.createElement('article')
      el.className='rounded-2xl border border-white/10 bg-slate-800/60 p-4'
      el.innerHTML = `<div class="font-semibold mb-2">${p.author||'Saya'}</div>${p.text?`<div class="mb-3">${p.text}</div>`:''}${media}`
      list.appendChild(el)
    })
  })
})
