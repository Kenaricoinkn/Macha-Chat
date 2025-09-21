// js/main.js
import { auth } from './firebase-init.js'
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'

// pastikan pakai versi composer_feed.js yang ada __composerBound, __unsubFeed, dll
import { bindComposer, startFeed, cleanupFeed } from './composer_feed.js'

const $ = (s) => document.querySelector(s)

// --- global guard: cegah boot dobel
if (window.__machaMainBooted) {
  console.debug('[macha] main.js already booted, skip')
} else {
  window.__machaMainBooted = true

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      location.replace('./login.html')
      return
    }

    // header info minimal
    const name = user.displayName || user.email?.split('@')[0] || 'Pengguna'
    $('#meName') && ($('#meName').textContent = name)

    // inisialisasi fitur (AMAN: internal guard mencegah bind dobel)
    bindComposer(user)
    startFeed(user)

    // logout
    $('#logoutBtn')?.addEventListener('click', async () => {
      try {
        cleanupFeed()       // lepas listener feed
        await signOut(auth)
      } finally {
        location.replace('./login.html')
      }
    })
  })
}
