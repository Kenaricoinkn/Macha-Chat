import { auth, db } from './firebase-init.js'
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  updateProfile, RecaptchaVerifier, signInWithPhoneNumber
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'
import { doc, setDoc, getDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'

const $ = s=>document.querySelector(s)
const show = el=> el.classList.remove('hidden')
const hide = el=> el.classList.add('hidden')
const toast = (msg)=>{ const t = $('#toast'); t.innerHTML = `<div>${msg}</div>`; show(t); setTimeout(()=>hide(t),2200) }

// Tabs
const tabEmail = $('#tab-email'), tabPhone = $('#tab-phone')
const pnlEmail = $('#panel-email'), pnlPhone = $('#panel-phone')
function selectTab(email=true){
  tabEmail.setAttribute('aria-selected', email?'true':'false')
  tabPhone.setAttribute('aria-selected', email?'false':'true')
  email ? (show(pnlEmail), hide(pnlPhone)) : (show(pnlPhone), hide(pnlEmail))
}
tabEmail.onclick=()=> selectTab(true)
tabPhone.onclick=()=> selectTab(false)

// Toggle password
$('#togglePass').onclick = ()=>{
  const p = $('#password'); p.type = p.type==='password' ? 'text' : 'password'
}

// Mode login/daftar (email)
let emailMode = 'login'
const refreshEmailMode = ()=> $('#btnEmail').textContent = (emailMode==='login'?'Masuk':'Daftar')
$('#linkToRegisterEmail').onclick = (e)=>{ e.preventDefault(); emailMode = (emailMode==='login'?'register':'login'); refreshEmailMode() }
refreshEmailMode()

// Submit email
$('#btnEmail').onclick = async ()=>{
  const email = $('#email').value.trim()
  const password = $('#password').value
  if(!email || !password) return toast('Lengkapi email & sandi')

  try{
    if(emailMode==='login'){
      await signInWithEmailAndPassword(auth,email,password)
      toast('Berhasil masuk')
    } else {
      const cred = await createUserWithEmailAndPassword(auth,email,password)
      await setDoc(doc(db,'users',cred.user.uid),{
        name: cred.user.displayName || email.split('@')[0],
        email, createdAt: serverTimestamp()
      })
      toast('Akun dibuat')
    }
  }catch(err){ toast(err.message) }
}

// Phone auth
let recaptchaVerifier = null, confirmationResult = null
function normalizeIDPhone(raw){
  let p = (raw||'').replace(/\s|-/g,'')
  if(p.startsWith('+')) return p
  if(p.startsWith('0')) return '+62'+p.slice(1)
  return p
}
function ensureRecaptcha(){
  if(!recaptchaVerifier){
    recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size:'invisible' })
  }
}
$('#sendOTP').onclick = async ()=>{
  try{
    const phone = normalizeIDPhone($('#phone').value)
    if(!/^\+\d{8,15}$/.test(phone)) return toast('Nomor tidak valid')
    ensureRecaptcha()
    confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier)
    show($('#otpArea')); toast('Kode OTP dikirim')
  }catch(err){ toast(err.message) }
}
$('#verifyOTP').onclick = async ()=>{
  if(!confirmationResult) return toast('Kirim kode dulu')
  const code = $('#otp').value.trim()
  if(code.length!==6) return toast('Kode 6 digit')
  try{
    const cred = await confirmationResult.confirm(code)
    const uref = doc(db,'users',cred.user.uid); const snap = await getDoc(uref)
    if(!snap.exists()){
      await setDoc(uref,{
        name: cred.user.displayName || cred.user.phoneNumber,
        phone: cred.user.phoneNumber,
        email: cred.user.email || '',
        createdAt: serverTimestamp()
      })
    }
    toast('Verifikasi berhasil')
  }catch(err){ toast(err.message) }
}
$('#linkToRegisterPhone').onclick = (e)=>{ e.preventDefault(); selectTab(false); toast('Masukkan nomor lalu verifikasi OTP') }
$('#useEmail').onclick = ()=> selectTab(true)

// Redirect jika sudah login
export function watchRedirectAfterLogin(){
  onAuthStateChanged(auth, (user)=>{
    if(user){
      location.href = './dashboard.html'   // ganti jika perlu
    }
  })
}
