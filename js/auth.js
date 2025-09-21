import { auth, db } from './firebase-init.js'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'
import {
  doc, setDoc, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'

/* ========== helpers ========== */
const $ = (s) => document.querySelector(s)
const show = (el) => el && el.classList.remove('hidden')
const hide = (el) => el && el.classList.add('hidden')
const toast = (msg) => {
  const t = $('#toast')
  if (!t) { console.warn('toast element missing'); return }
  t.innerHTML =
    `<div style="background:#fff;color:#111;padding:10px 14px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.3)">${msg}</div>`
  show(t); setTimeout(() => hide(t), 2200)
}
const setBusy = (busy) => {
  const btn = $('#btnEmail')
  if (!btn) return
  btn.disabled = !!busy
  btn.classList.toggle('opacity-60', !!busy)
  btn.textContent = busy ? 'Memproses…' : (state.mode === 'login' ? 'Masuk' : 'Daftar')
}

/* ========== state ========== */
const state = {
  mode: 'login', // 'login' | 'register'
  working: false,
}

/* ========== UI bindings ========== */
function applyModeUI() {
  const btn = $('#btnEmail')
  const link = $('#linkToRegisterEmail')
  const title = $('.brand') // opsional

  if (btn) btn.textContent = state.mode === 'login' ? 'Masuk' : 'Daftar'
  if (link) link.textContent = state.mode === 'login' ? 'Daftar' : 'Masuk'
  if (title) title.querySelector?.('span')?.classList.toggle('opacity-80', state.mode === 'register')
  const notice = $('#notice'); if (notice) hide(notice)
}

function switchMode(e) {
  e?.preventDefault?.()
  if (state.working) return
  state.mode = state.mode === 'login' ? 'register' : 'login'
  applyModeUI()
}

function togglePass() {
  const p = $('#password'); if (!p) return
  p.type = p.type === 'password' ? 'text' : 'password'
}

/* ========== core actions ========== */
async function handleEmailSubmit() {
  const emailEl = $('#email'), passEl = $('#password'), notice = $('#notice')
  if (!emailEl || !passEl) { console.warn('email/password element missing'); return }
  const email = emailEl.value.trim()
  const password = passEl.value

  if (!email || !password) return toast('Lengkapi email & sandi')
  if (password.length < 6) return toast('Sandi minimal 6 karakter')

  try {
    state.working = true; setBusy(true)

    // pastikan sesi tetap tersimpan (sekali lagi di sini agar aman)
    await setPersistence(auth, browserLocalPersistence)

    if (state.mode === 'login') {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      if (!cred.user.emailVerified) {
        await signOut(auth)
        if (notice) {
          notice.textContent = 'Email belum diverifikasi. Cek Gmail kamu lalu coba login lagi.'
          show(notice)
        }
        return
      }
      // sukses → dashboard
      location.replace('./dashboard.html')
    } else {
      // register
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      // buat profil dasar di Firestore
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: email.split('@')[0],
        email,
        createdAt: serverTimestamp(),
      })
      // kirim verifikasi email
      await sendEmailVerification(cred.user)
      if (notice) {
        notice.textContent = 'Akun dibuat! Silakan cek Gmail kamu untuk verifikasi sebelum login.'
        show(notice)
      }
      // keluar dulu sampai user verifikasi
      await signOut(auth)
      // pindah ke mode login agar user tidak bingung
      state.mode = 'login'; applyModeUI()
    }
  } catch (err) {
    console.error(err)
    // sederhanakan pesan error
    const msg = (err?.code || err?.message || 'Terjadi kesalahan')
      .replace('Firebase: ', '')
      .replace('(auth/', '(')
    toast(msg)
  } finally {
    state.working = false; setBusy(false)
  }
}

/* ========== exported initializer ========== */
export function initAuthUI() {
  // tombol submit
  $('#btnEmail')?.addEventListener('click', handleEmailSubmit)
  // Enter untuk submit
  $('#email')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleEmailSubmit() })
  $('#password')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleEmailSubmit() })
  // toggle show/hide password
  $('#togglePass')?.addEventListener('click', togglePass)
  // ganti mode login/daftar
  $('#linkToRegisterEmail')?.addEventListener('click', switchMode)

  applyModeUI()

  // Jika user sudah login & verified dan entah bagaimana mendarat di login.html → langsung ke dashboard
  onAuthStateChanged(auth, (user) => {
    if (user && user.emailVerified) {
      location.replace('./dashboard.html')
    }
  })
}
