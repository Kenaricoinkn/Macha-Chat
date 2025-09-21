import { auth, $, toast } from './config.js'
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'
import { initMenuUI } from './menu.js'
import { initComposer, startFeed } from './composer_feed.js'
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'

document.addEventListener('DOMContentLoaded', ()=>{
  onAuthStateChanged(auth, async (user)=>{
    if(!user){ location.replace('./index.html'); return }
    document.getElementById('btnPlus')?.addEventListener('click', ()=>toast('Aksi cepat coming soon'))
    document.getElementById('btnSearch')?.addEventListener('click', ()=>toast('Pencarian coming soon'))
    initMenuUI(user)
    initComposer(user)
    startFeed(user)
  })
})
