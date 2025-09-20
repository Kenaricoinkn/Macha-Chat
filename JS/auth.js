// ==== Phone Auth helpers ====
let recaptchaVerifier = null
let confirmationResult = null

function normalizeIDPhone(raw){
  let p = (raw||'').replace(/\s|-/g,'')
  if(p.startsWith('+')) return p
  if(p.startsWith('0')) return '+62'+p.slice(1)
  return p
}

export function setupRecaptcha(){
  const containerId = 'recaptcha-container'
  if(!recaptchaVerifier && document.getElementById(containerId)){
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size: 'invisible' })
  }
}

export async function onSendOTP(e){
  e.preventDefault()
  try{
    const phone = normalizeIDPhone($('#phoneNumber').value)
    if(!phone || !/^\+\d{8,15}$/.test(phone)) return toast('Nomor HP tidak valid')
    setupRecaptcha()
    confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier)
    toast('Kode dikirim')
    document.getElementById('otpArea')?.classList.remove('hidden')
  }catch(err){ toast(err.message) }
}

export async function onVerifyOTP(e){
  e.preventDefault()
  if(!confirmationResult) return toast('Kirim kode dulu')
  const code = document.getElementById('otpCode').value.trim()
  if(code.length!==6) return toast('Kode harus 6 digit')
  try{
    const cred = await confirmationResult.confirm(code)
    const user = cred.user
    // Set displayName ke nomor hp agar UI rapi
    if(user && !user.displayName){ await updateProfile(user,{ displayName: user.phoneNumber }) }

    // Pastikan dokumen user ada
    const uref = doc(db,'users',user.uid)
    const us = await getDoc(uref)
    if(!us.exists()){
      await setDoc(uref,{
        name: user.displayName || user.phoneNumber,
        phone: user.phoneNumber,
        email: user.email || '',
        createdAt: serverTimestamp(),
        aliases: [user.displayName || user.phoneNumber],
        activeAlias: (user.displayName || user.phoneNumber)
      })
    }
    toast('Login nomor HP berhasil')
  }catch(err){ toast(err.message) }
}
