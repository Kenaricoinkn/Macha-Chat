// js/main.js
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'
import { auth } from './config.js'
import { initComposer, startFeed } from './composer_feed.js'

const $ = (s)=>document.querySelector(s)
const toast = (msg)=>{
  const t = $('#toast'); if(!t) return;
  t.innerHTML = `<div class="px-4 py-2 rounded-xl bg-white text-slate-900 shadow">${msg}</div>`;
  t.classList.remove('hidden'); setTimeout(()=>t.classList.add('hidden'), 2000)
}

// kecil untuk avatar upload ke Cloudinary
async function uploadAvatar(file, folder='avatars'){
  const sig = await fetch(`/api/cloudinary-sign?folder=${encodeURIComponent(folder)}`).then(r=>r.json())
  const form = new FormData()
  form.append('file', file)
  form.append('api_key', sig.api_key)
  form.append('timestamp', sig.timestamp)
  form.append('upload_preset', sig.upload_preset)
  if(sig.folder) form.append('folder', sig.folder)
  form.append('signature', sig.signature)
  const resp = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`, { method:'POST', body:form })
  const json = await resp.json()
  if(!resp.ok) throw new Error(json.error?.message||'Upload gagal')
  return json.secure_url
}

if (!window.__machaMainBooted) {
  window.__machaMainBooted = true

  onAuthStateChanged(auth, (user)=>{
    if (!user) { location.replace('./index.html'); return }

    // ====== Header & Drawer profile ======
    const name = user.displayName || user.email?.split('@')[0] || 'Pengguna'
    const avatarFallback = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`
    $('#meAvatar') && ($('#meAvatar').src = avatarFallback)
    $('#profileName') && ($('#profileName').textContent = name)
    $('#profileAvatar') && ($('#profileAvatar').src = avatarFallback)

    // ====== Menu drawer open/close ======
    const panel = $('#menuPanel'), openBtn = $('#btnMenu'), closeBtn = $('#menuClose'), backdrop = $('#menuBackdrop')
    const openMenu  = ()=> panel?.classList.remove('hidden')
    const closeMenu = ()=> panel?.classList.add('hidden')
    openBtn?.addEventListener('click', openMenu)
    closeBtn?.addEventListener('click', closeMenu)
    backdrop?.addEventListener('click', closeMenu)

    // Keluar dari drawer
    $('#logoutFromMenu')?.addEventListener('click', async ()=>{
      try { await signOut(auth) } finally { location.replace('./index.html') }
    })

    // Ganti foto (upload ke Cloudinary)
    $('#avatarFile')?.addEventListener('change', async (e)=>{
      const file = e.target.files?.[0]; if(!file) return
      try{
        toast('Mengunggah foto…')
        const url = await uploadAvatar(file, `avatars/${user.uid}`)
        // set langsung di UI
        if($('#meAvatar')) $('#meAvatar').src = url
        if($('#profileAvatar')) $('#profileAvatar').src = url
        toast('Foto profil diperbarui ✅')
      }catch(err){ console.error(err); toast(err.message) }
      finally{ e.target.value = '' }
    })

    // ====== Fitur utama ======
    initComposer(user)
    startFeed(user)
  })
}
