import './firebase-init.js'
import { watchRedirectAfterLogin } from './auth.js'

// cukup import auth.js; ia sudah bind semua handler UI
watchRedirectAfterLogin()
