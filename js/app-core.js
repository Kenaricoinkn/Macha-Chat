import { initAuthUI } from './auth.js'

// Jalankan hanya kalau elemen-elemen login ada di halaman
function safeInit() {
  // salah satu id unik di login.html
  const hasLoginForm = document.getElementById('btnEmail') || document.getElementById('panel-email')
  if (!hasLoginForm) return  // bukan halaman login → diam

  try {
    initAuthUI()
  } catch (e) {
    console.error('Gagal init login UI:', e)
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', safeInit)
} else {
  safeInit()
}
