// js/app-core.js
import { initAuthUI } from './auth.js';

// pastikan jalan setelah DOM siap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuthUI);
} else {
  initAuthUI();
}
