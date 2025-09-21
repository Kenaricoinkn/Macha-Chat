import { auth, $, toast } from './config.js'
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'
import { initMenuUI } from './menu.js'
import { initComposer, startFeed, renderStories } from './composer_feed.js'

function ready(fn){ document.readyState==='loading' ? document.addEventListener('DOMContentLoaded', fn) : fn() }

ready(()=>{
  onAuthStateChanged(auth, (user)=>{
    if(!user){ location.replace('./index.html'); return }
    $('#btnPlus')?.addEventListener('click', ()=>toast('Aksi cepat coming soon'))
    $('#btnSearch')?.addEventListener('click', ()=>toast('Pencarian coming soon'))
    initMenuUI(user)
    initComposer(user)
    renderStories(user.displayName||user.email)
    startFeed(user)
  })
})
