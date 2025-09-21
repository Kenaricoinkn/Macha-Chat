import { auth, db, $, toast } from './config.js'
import { signOut, updateProfile } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'
import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js'

function setUploadProgress(pct){
  const bar = document.getElementById('uploadBar')
  const prog = document.getElementById('uploadProg')
  if(!bar||!prog) return; bar.classList.remove('hidden'); prog.style.width=pct+'%'; if(pct>=100) setTimeout(()=>bar.classList.add('hidden'),600)
}

// upload avatar ke Cloudinary
async function uploadToCloudinary(file, folder){
  const sig = await fetch(`/api/cloudinary-sign?folder=${encodeURIComponent(folder)}`).then(r=>r.json())
  const form = new FormData()
  form.append('file', file)
  form.append('api_key', sig.api_key)
  form.append('timestamp', sig.timestamp)
  form.append('upload_preset', sig.upload_preset)
  if(sig.folder) form.append('folder', sig.folder)
  form.append('signature', sig.signature)

  // progress via fetch tidak native; minimal tampil full di akhir
  const resp = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloud_name}/auto/upload`, { method:'POST', body:form })
  const json = await resp.json()
  if(!resp.ok) throw new Error(json.error?.message||'Upload gagal')
  setUploadProgress(100)
  return json.secure_url
}

export function initMenuUI(user){
  const panel=$('#menuPanel'), open=$('#btnMenu'), close=$('#menuClose'), back=$('#menuBackdrop')
  const logout=$('#logoutFromMenu')
  open?.addEventListener('click', ()=>panel.classList.remove('hidden'))
  close?.addEventListener('click', ()=>panel.classList.add('hidden'))
  back?.addEventListener('click',  ()=>panel.classList.add('hidden'))
  logout?.addEventListener('click', async()=>{ await signOut(auth); location.replace('./index.html') })

  // isi profil
  const nameEl=$('#profileName'), avatEl=$('#profileAvatar')
  let displayName=user.displayName||user.email||'Pengguna'
  let avatar=user.photoURL||`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(displayName)}`
  ;(async()=>{
    try{ const us=await getDoc(doc(db,'users',user.uid)); if(us.exists()){ const d=us.data(); if(d.name) displayName=d.name; if(d.photoURL) avatar=d.photoURL } }catch{}
    nameEl.textContent=displayName; avatEl.src=avatar; $('#meAvatar').src=avatar
  })()

  // ganti foto
  $('#avatarFile')?.addEventListener('change', async(e)=>{
    const file=e.target.files?.[0]; if(!file) return
    try{
      const url = await uploadToCloudinary(file, `avatars/${user.uid}`)
      await updateProfile(user,{photoURL:url})
      try{ await updateDoc(doc(db,'users',user.uid),{photoURL:url}) }catch{}
      $('#profileAvatar').src=url; $('#meAvatar').src=url
      toast('Foto profil diperbarui')
    }catch(err){ toast(err.message) }
  })
}
