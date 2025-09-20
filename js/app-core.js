import { initAuthUI } from './auth.js'

// Pastikan DOM siap sebelum binding
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuthUI)
} else {
  initAuthUI()
}
