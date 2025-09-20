import { auth, db } from './firebase-init.js'
import { show, hide, $, $$, toast } from './router.js'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'

export function bindAuthForms(){
  $('#loginForm')?.addEventListener('submit', async (e)=>{
    e.preventDefault()
    const email=$('#loginEmail').value.trim(), pass=$('#loginPass').value
    try{ await signInWithEmailAndPassword(auth,email,pass); toast('Berhasil masuk') }catch(err){ toast(err.message) }
  })

  $('#regForm')?.addEventListener('submit', async (e)=>{
    e.preventDefault()
    const name=$('#regName').value.trim(), email=$('#regEmail').value.trim(), pass=$('#regPass').value
    try{
      const cred = await createUserWithEmailAndPassword(auth,email,pass)
      await updateProfile(cred.user,{ displayName:name })
      await setDoc(doc(db,'users',cred.user.uid),{ name, email, createdAt: serverTimestamp(), aliases:[name], activeAlias:name })
      toast('Akun dibuat')
    }catch(err){ toast(err.message) }
  })

  $('#logoutBtn')?.addEventListener('click', ()=> signOut(auth))

  $('#aliasForm')?.addEventListener('submit', async (e)=>{
    e.preventDefault()
    const alias = $('#aliasInput').value.trim(); if(!alias) return
    const u = auth.currentUser; if(!u) return toast('Masuk dulu')
    const uref = doc(db,'users',u.uid); const snap = await getDoc(uref)
    const data = snap.data()||{aliases:[],activeAlias:''}
    if(data.aliases.includes(alias)) return toast('Nama profil sudah ada')
    data.aliases.push(alias); data.activeAlias = alias
    await updateDoc(uref,{ aliases:data.aliases, activeAlias:alias })
    $('#aliasInput').value=''
    renderAliases(data.aliases, data.activeAlias)
    toast('Profil ditambah & dipilih')
  })
}

export async function renderAliases(list=[], active=''){
  const wrap = $('#aliasList'); if(!wrap) return
  wrap.innerHTML = ''
  list.forEach(a=>{
    const b = document.createElement('button')
    b.className = 'px-3 py-1.5 rounded-xl border border-white/10 ' + (a===active?'bg-brand text-white':'bg-slate-800')
    b.textContent = a
    b.onclick = async ()=>{
      const u = auth.currentUser; if(!u) return
      const uref = doc(db,'users',u.uid)
      await updateDoc(uref,{ activeAlias:a }); toast('Profil aktif: '+a)
    }
    wrap.appendChild(b)
  })
}

export function watchAuth(callback){
  onAuthStateChanged(auth, async (user)=>{
    const gate = $('#gate'), appSec = $('#app'), authArea = $('#authArea')
    authArea.innerHTML = ''

    if(user){
      // UI
      hide(gate); show(appSec)
      const name = user.displayName || user.email
      authArea.innerHTML = `<div class="flex items-center gap-2"><span class="hidden sm:block text-sm">${name}</span><img class="w-8 h-8 rounded-full bg-slate-700"/></div>`
      $('#meAvatar').src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`
      $('#pAvatar').src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`
      $('#pName').textContent = user.displayName || 'Tanpa Nama'
      $('#pEmail').textContent = user.email

      // ensure user doc exists & render aliases
      const uref = doc(db,'users',user.uid)
      const us = await getDoc(uref)
      if(!us.exists()) await setDoc(uref,{ name:user.displayName||'', email:user.email, createdAt:serverTimestamp(), aliases:[user.displayName||user.email], activeAlias:(user.displayName||user.email) })
      const data = (await getDoc(uref)).data();
      renderAliases(data.aliases||[], data.activeAlias)
    } else {
      show(gate); hide(appSec)
      authArea.innerHTML = `<button id="openAuth" class="px-3 py-1.5 rounded-xl bg-brand text-white">Masuk / Daftar</button>`
      $('#openAuth').onclick = ()=>{ hide(appSec); show(gate) }
    }

    callback?.(user)
  })
}
