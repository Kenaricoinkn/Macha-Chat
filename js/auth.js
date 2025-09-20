import { auth, db } from './firebase-init.js'
import {
  onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, sendEmailVerification, signOut
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'
import { doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'

const $ = s => document.querySelector(s)
const show = el => el && el.classList.remove('hidden')
const hide = el => el && el.classList.add('hidden')
const toast = (msg)=>{
  const t = $('#toast'); if(!t) return console.warn('toast element missing')
  t.innerHTML = `<div style="background:#fff;color:#111;padding:10px 14px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.3)">${msg}</div>`
  show(t); setTimeout(()=>hide(t), 2200)
}

// ==== Logic ====
let emailMode = 'login' // 'login' | 'register'

async function handleEmailSubmit(){
  const emailEl = $('#email'), passEl = $('#password'), notice = $('#notice')
  if(!emailEl || !passEl){ return console.warn('email/password element missing')}
  const email = emailEl.value.trim()
  const password = passEl.value
  if(!email || !password) return toast('Lengkapi email & sandi')

  try{
    if(emailMode==='login'){
      const cred = await signInWithEmailAndPassword(auth,email,password)
      if(!cred.user.emailVerified){
        await signOut(auth)
        if(notice){ notice.textContent = 'Email belum diverifikasi. Cek Gmail kamu lalu coba login lagi.'; show(notice) }
        return
      }
      window.location.href = './dashboard.html'
    }else{
      const cred = await createUserWithEmailAndPassword(auth,email,password)
      await setDoc(doc(db,'users',cred.user.uid),{
        name: email.split('@')[0], email, createdAt: serverTimestamp()
      })
      await sendEmailVerification(cred.user)
      if(notice){ notice.textContent = 'Akun dibuat! Silakan cek Gmail kamu untuk verifikasi sebelum login.'; show(notice) }
      await signOut(auth)
    }
  }catch(err){ console.error(err); toast(err.message) }
}

function togglePass(){
  const p = $('#password'); if(!p) return
  p.type = (p.type === 'password') ? 'text' : 'password'
}

function switchMode(e){
  e?.preventDefault?.()
  emailMode = (emailMode === 'login') ? 'register' : 'login'
  const btn = $('#btnEmail'); if(btn) btn.textContent = (emailMode==='login'?'Masuk':'Daftar')
}

// ==== Bind safely AFTER DOM ready ====
export function initAuthUI(){
  // tombol submit
  const btn = $('#btnEmail'); if(btn) btn.addEventListener('click', handleEmailSubmit)

  // toggle pass
  const eye = $('#togglePass'); if(eye) eye.addEventListener('click', togglePass)

  // link ganti mode
  const link = $('#linkToRegisterEmail'); if(link) link.addEventListener('click', switchMode)

  // set label tombol awal
  const btn2 = $('#btnEmail'); if(btn2) btn2.textContent = (emailMode==='login'?'Masuk':'Daftar')

  // guard: jika sudah login & verified → dashboard
  onAuthStateChanged(auth,(user)=>{
    if(user && user.emailVerified){
      window.location.href = './dashboard.html'
    }
  })
}
