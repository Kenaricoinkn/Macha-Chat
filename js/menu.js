import { auth, db, storage, $, toast } from './config.js'
import { onAuthStateChanged, signOut, updateProfile } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'
import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'
import { ref, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js'

function setUploadProgress(pct){
  const bar = document.getElementById('uploadBar')
  const prog = document.getElementById('uploadProg')
  if(!bar || !prog) return
  bar.classList.remove('hidden'); prog.style.width = pct+'%'; if(pct>=100) setTimeout(()=>bar.classList.add('hidden'),600)
}

export function initMenuUI(user){
  const panel = $('#menuPanel'), open = $('#btnMenu'), close = $('#menuClose'), back = $('#menuBackdrop')
  const logoutMenu = $('#logoutFromMenu')
  open?.addEventListener('click', ()=> panel.classList.remove('hidden'))
  close?.addEventListener('click', ()=> panel.classList.add('hidden'))
  back?.addEventListener('click',  ()=> panel.classList.add('hidden'))
  logoutMenu?.addEventListener('click', async ()=>{ await signOut(auth); location.replace('./index.html') })

  // isi nama & avatar
  const profileName = $('#profileName')
  const profileAvatar = $('#profileAvatar')
  let displayName = user.displayName || user.email || 'Pengguna'
  let avatar = user.photoURL || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(displayName)}`
  ;(async()=>{
    try{
      const us = await getDoc(doc(db,'users',user.uid))
      if(us.exists()){
        const d = us.data()
        if(d.name) displayName = d.name
        if(d.photoURL) avatar = d.photoURL
      }
    }catch{}
    profileName.textContent = displayName
    profileAvatar.src = avatar
    $('#meAvatar').src = avatar
  })()

  // ganti foto profil
  $('#avatarFile')?.addEventListener('change', (e)=>{
    const file = e.target.files?.[0]; if(!file) return
    const r = ref(storage, `avatars/${user.uid}/avatar.${(file.name.split('.').pop()||'jpg').toLowerCase()}`)
    const task = uploadBytesResumable(r, file)
    task.on('state_changed', s=>{
      setUploadProgress(Math.round(100*s.bytesTransferred/s.totalBytes))
    }, err=>toast(err.message), async ()=>{
      const url = await getDownloadURL(r)
      await updateProfile(user, { photoURL:url })
      try{ await updateDoc(doc(db,'users',user.uid), { photoURL:url }) }catch{}
      $('#profileAvatar').src = url; $('#meAvatar').src = url
      toast('Foto profil diperbarui')
    })
  })
}
