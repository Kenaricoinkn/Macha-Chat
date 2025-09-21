// js/auth.js — FINAL (pakai config.js, no duplicate app)

import { auth, db } from './config.js'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'
import { doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'

/* ---------- helpers kecil ---------- */
const $ = (s) => document.querySelector(s)
const show = (el) => el && el.classList.remove('hidden')
const hide = (el) => el && el.classList.add('hidden')
const toast = (msg) => {
  const t = $('#toast'); if (!t) return
  t.innerHTML = `<div style="background:#fff;color:#111;padding:10px 14px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.3)">${msg}</div>`
  show(t); setTimeout(() => hide(t), 2200)
}

/* ---------- state ---------- */
let emailMode = 'login' // 'login' | 'register'

/* ---------- actions ---------- */
async function handleEmailSubmit () {
  const emailEl = $('#email')
  const passEl  = $('#password')
  const notice  = $('#notice')
  if (!emailEl || !passEl) return console.warn('email/password element missing')

  const email = emailEl.value.trim()
  const password = passEl.value
  if (!email || !password) return toast('Lengkapi email & sandi')

  try {
    if (emailMode === 'login') {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      if (!cred.user.emailVerified) {
        await signOut(auth)
        if (notice) {
          notice.textContent = 'Email belum diverifikasi. Cek Gmail kamu lalu coba login lagi.'
          show(notice)
        }
        return
      }
      window.location.href = './dashboard.html'
    } else {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: email.split('@')[0],
        email,
        createdAt: serverTimestamp()
      })
      await sendEmailVerification(cred.user)
      if (notice) {
        notice.textContent = 'Akun dibuat! Silakan cek Gmail kamu untuk verifikasi sebelum login.'
        show(notice)
      }
      await signOut(auth)
      // balikkan ke mode login
      emailMode = 'login'
      renderModeLabels()
    }
  } catch (err) {
    console.error(err)
    toast(err.message)
  }
}

function togglePass () {
  const p = $('#password'); if (!p) return
  p.type = (p.type === 'password') ? 'text' : 'password'
}

function switchMode (e) {
  e?.preventDefault?.()
  emailMode = (emailMode === 'login') ? 'register' : 'login'
  renderModeLabels()
}

function renderModeLabels () {
  const btn = $('#btnEmail')
  const link = $('#linkToRegisterEmail')

  if (emailMode === 'login') {
    if (btn)  btn.textContent  = 'Masuk'
    if (link) link.textContent = 'Daftar'
  } else {
    if (btn)  btn.textContent  = 'Daftar'
    if (link) link.textContent = 'Masuk'
  }
}

/* ---------- init (dipanggil dari app-core.js) ---------- */
export function initAuthUI () {
  // tombol submit
  $('#btnEmail')?.addEventListener('click', handleEmailSubmit)
  // toggle password
  $('#togglePass')?.addEventListener('click', togglePass)
  // ganti mode (login <-> daftar)
  $('#linkToRegisterEmail')?.addEventListener('click', switchMode)
  // set label awal
  renderModeLabels()

  // guard: kalau sudah login & verified → langsung dashboard
  onAuthStateChanged(auth, (user) => {
    if (user && user.emailVerified) {
      window.location.href = './dashboard.html'
    }
  })
}
