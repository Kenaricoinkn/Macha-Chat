// js/auth.js
import { auth, db, $, toast } from './config.js';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

let emailMode = 'login'; // 'login' | 'register'

async function handleEmailSubmit() {
  const emailEl = $('#email');
  const passEl  = $('#password');
  const notice  = $('#notice');
  if (!emailEl || !passEl) return;

  const email = emailEl.value.trim();
  const password = passEl.value;
  if (!email || !password) return toast('Lengkapi email & sandi');

  try {
    if (emailMode === 'login') {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (!cred.user.emailVerified) {
        await signOut(auth);
        if (notice) {
          notice.textContent = 'Email belum diverifikasi. Cek Gmail kamu lalu coba login lagi.';
          notice.classList.remove('hidden');
        }
        return;
      }
      window.location.href = './dashboard.html';
    } else {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: email.split('@')[0],
        email,
        createdAt: serverTimestamp()
      });
      await sendEmailVerification(cred.user);
      if (notice) {
        notice.textContent = 'Akun dibuat! Cek email untuk verifikasi, lalu login.';
        notice.classList.remove('hidden');
      }
      await signOut(auth);
      // balik ke mode login
      emailMode = 'login';
      const btn = $('#btnEmail'); if (btn) btn.textContent = 'Masuk';
    }
  } catch (err) {
    console.error(err);
    toast(err.message);
  }
}

function togglePass() {
  const p = $('#password'); if (!p) return;
  p.type = (p.type === 'password') ? 'text' : 'password';
}

function switchMode(e) {
  e?.preventDefault?.();
  emailMode = (emailMode === 'login') ? 'register' : 'login';
  const btn = $('#btnEmail'); if (btn) btn.textContent = (emailMode === 'login' ? 'Masuk' : 'Daftar');
}

export function initAuthUI() {
  // tombol submit
  $('#btnEmail')?.addEventListener('click', handleEmailSubmit);
  // toggle pass
  $('#togglePass')?.addEventListener('click', togglePass);
  // ganti mode
  $('#linkToRegisterEmail')?.addEventListener('click', switchMode);
  // set label awal
  const btn = $('#btnEmail'); if (btn) btn.textContent = (emailMode === 'login' ? 'Masuk' : 'Daftar');

  // guard: sudah login & verified → dashboard
  onAuthStateChanged(auth, (user) => {
    if (user && user.emailVerified) {
      window.location.href = './dashboard.html';
    }
  });
}
