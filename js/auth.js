import { auth, db } from './firebase-init.js'
import {
  onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, sendEmailVerification, signOut
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'
import { doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'

const $ = s=>document.querySelector(s)
const show = el=> el.classList.remove('hidden')
const hide = el=> el.classList.add('hidden')
const toast = (msg)=>{ const t = $('#toast'); t.innerHTML = `<div>${msg}</div>`; show(t); setTimeout(()=>hide(t),2200) }

// toggle password
$('#togglePass').onclick = ()=>{
  const p = $('#password'); p.type = p.type==='password' ? 'text' : 'password'
}

// mode login/daftar
let emailMode = 'login'
const refreshEmailMode = ()=> $('#btnEmail').textContent = (emailMode==='login'?'Masuk':'Daftar')
$('#linkToRegisterEmail').onclick = (e)=>{ e.preventDefault(); emailMode = (emailMode==='login'?'register':'login'); refreshEmailMode() }
refreshEmailMode()

// submit
$('#btnEmail').onclick = async ()=>{
  const email = $('#email').value.trim()
  const password = $('#password').value
  if(!email || !password) return toast('Lengkapi email & sandi')

  try{
    if(emailMode==='login'){
      const cred = await signInWithEmailAndPassword(auth,email,password)
      if(!cred.user.emailVerified){
        await signOut(auth)
        $('#notice').textContent = "Email belum diverifikasi. Cek Gmail kamu lalu coba login lagi."
        show($('#notice'))
        return
      }
      window.location.href = './dashboard.html'
    } else {
      const cred = await createUserWithEmailAndPassword(auth,email,password)
      await setDoc(doc(db,'users',cred.user.uid),{
        name: email.split('@')[0],
        email, createdAt: serverTimestamp()
      })
      await sendEmailVerification(cred.user)
      $('#notice').textContent = "Akun dibuat! Silakan cek Gmail kamu untuk verifikasi sebelum login."
      show($('#notice'))
      await signOut(auth)
    }
  }catch(err){ toast(err.message) }
}

// guard: kalau sudah login & verified → dashboard
onAuthStateChanged(auth,(user)=>{
  if(user && user.emailVerified){
    window.location.href = './dashboard.html'
  }
})
