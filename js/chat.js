import { auth, db, $ } from './config.js'
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, getDocs, where, limit } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'

let me=null, roomId=null

onAuthStateChanged(auth, async (user)=>{
  if(!user){ location.replace('./index.html'); return }
  me=user
  $('#startChat').addEventListener('click', async ()=>{
    const peer = $('#peerEmail').value.trim().toLowerCase()
    if(!peer) return
    // room id deterministik: emailA|emailB (urut alfabet)
    const a=(me.email||'').toLowerCase(), b=peer
    roomId = [a,b].sort().join('|')
    $('#room').classList.remove('hidden')
    startRoom(roomId)
  })
  $('#send').addEventListener('click', async ()=>{
    const text=$('#msg').value.trim(); if(!text) return
    await addDoc(collection(db, `chats/${roomId}/messages`), {
      from: me.uid, text, at: serverTimestamp()
    })
    $('#msg').value=''
  })
})

function startRoom(id){
  const log=$('#log')
  const q=query(collection(db, `chats/${id}/messages`), orderBy('at','asc'))
  onSnapshot(q, snap=>{
    log.innerHTML=''
    snap.forEach(d=>{
      const m=d.data()
      const mine = m.from===me.uid
      const row=document.createElement('div')
      row.className='flex'
      row.innerHTML=`<div class="max-w-[75%] px-3 py-2 rounded-2xl ${mine?'ml-auto bg-brand/80':'bg-slate-700/80'}">${m.text}</div>`
      log.appendChild(row)
    })
    log.scrollTop=log.scrollHeight
  })
}
