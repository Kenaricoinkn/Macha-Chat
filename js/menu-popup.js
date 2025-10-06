// ============================
// MENU POPUP POLISHED (v5 FINAL)
// ============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDIsTmg0_-rcz9tH3U-_sZuWk7sUOLgMSw",
  authDomain: "macha-chat.firebaseapp.com",
  projectId: "macha-chat",
  storageBucket: "macha-chat.firebasestorage.app",
  messagingSenderId: "576142384286",
  appId: "1:576142384286:web:cfed000ac8a50b662a6f8f",
  measurementId: "G-6ZMFHMZVEK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const menuBtn = document.getElementById("menuBtn");
const menuPopup = document.getElementById("menuPopup");

if (menuBtn && menuPopup) {
  // ===== TEMPLATE =====
  menuPopup.innerHTML = `
    <div class="menu-overlay hidden fixed inset-0 z-[80] flex flex-col items-center justify-start bg-black/60 backdrop-blur-lg transition-opacity duration-500 opacity-0">
      <div class="w-full max-w-md mx-auto mt-6 bg-[#0f142b]/95 rounded-2xl shadow-xl border border-slate-700/40 overflow-hidden animate-fadeIn">
        
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-slate-600/40">
          <button id="backMenu" class="text-slate-300 hover:text-indigo-400 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 class="text-lg font-semibold text-indigo-300">Menu</h2>
          <button id="closeMenu" class="text-slate-300 hover:text-red-400 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Profile -->
        <div class="flex items-center gap-3 px-5 py-4 border-b border-slate-700/40">
          <img src="https://ui-avatars.com/api/?name=User" class="w-12 h-12 rounded-full border border-slate-500" id="profileImg" alt="Profile"/>
          <div>
            <h3 class="font-semibold text-slate-100 text-base" id="profileName">Pengguna</h3>
            <p class="text-sm underline text-indigo-400 hover:text-indigo-300 cursor-pointer">Lihat profil Anda</p>
          </div>
        </div>

        <!-- Menu Grid -->
        <div class="grid grid-cols-2 gap-3 p-5">
          ${[
            ["Beranda","M3 9.75 12 4l9 5.75V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.75z"],
            ["Postingan","M12 8v8m-4-4h8"],
            ["Grup","M9 17v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m4 0V9a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v8m12 0H5"],
            ["Live","M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14m0-4v4M6 6h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"],
            ["Store","M3 7h18l-2 13H5L3 7zM16 3H8v4h8V3z"],
            ["Reels","M4.75 4.75l14.5 14.5m0-14.5L4.75 19.25"]
          ].map(([name,path])=>`
            <div class="menu-item bg-slate-800/50 hover:bg-indigo-600/40 transition p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-200 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${path}"/></svg>
              <span class="text-sm font-medium">${name}</span>
            </div>
          `).join("")}
        </div>

        <!-- Footer -->
        <div class="px-5 pb-5 space-y-3 border-t border-slate-700/40 text-sm">
          <button id="settingsToggle" class="flex items-center w-full gap-2 text-indigo-400 hover:text-indigo-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2"/>
            </svg>
            Pengaturan & Privasi
            <svg id="arrowIcon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-4 h-4 ml-auto transition-transform"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9l6 6 6-6"/></svg>
          </button>

          <div id="settingsDropdown" class="hidden ml-6 mt-3 space-y-2 text-slate-300 text-[0.9rem]">
            <button id="btnSettings" class="flex items-center gap-2 hover:text-indigo-300"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2"/></svg> Pengaturan</button>
            <button id="btnPayments" class="flex items-center gap-2 hover:text-indigo-300"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h18v4H3zM3 7h18v13H3z"/></svg> Pesanan & Pembayaran</button>
            <button id="btnDarkMode" class="flex items-center gap-2 hover:text-indigo-300"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.79A9 9 0 1 1 12 3v9h9z"/></svg> Mode Gelap</button>
            <button id="btnLanguage" class="flex items-center gap-2 hover:text-indigo-300"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h18M9 3v2m6-2v2M3 10h18m-9 4v7"/></svg> Bahasa</button>
            <button id="btnClean" class="flex items-center gap-2 hover:text-indigo-300"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5-4h4a1 1 0 0 1 1 1v1H9V4a1 1 0 0 1 1-1z"/></svg> Bersihkan Ruang</button>
            <button id="btnAccess" class="flex items-center gap-2 hover:text-indigo-300"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V9l7 4-7 4z"/></svg> Akses Awal</button>
          </div>

          <button class="flex items-center gap-2 hover:text-indigo-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h8m-8 4h5m1 5a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/>
            </svg> Bantuan & Dukungan
          </button>

          <button class="flex items-center gap-2 hover:text-indigo-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg> Tambahkan Akun
          </button>

          <button id="logoutMenu" class="flex items-center gap-2 text-red-400 hover:text-red-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H3m12 0l-4-4m4 4l-4 4"/>
            </svg> Keluar
          </button>
        </div>
      </div>
    </div>
  `;

  const overlay = menuPopup.querySelector(".menu-overlay");
  const closeMenu = menuPopup.querySelector("#closeMenu");
  const backMenu = menuPopup.querySelector("#backMenu");

  // === OPEN/CLOSE ===
  menuBtn.onclick = () => {
    overlay.classList.remove("hidden");
    requestAnimationFrame(() => overlay.classList.remove("opacity-0"));
  };
  const closeOverlay = () => {
    overlay.classList.add("opacity-0");
    setTimeout(() => overlay.classList.add("hidden"), 500);
  };
  closeMenu.onclick = closeOverlay;
  backMenu.onclick = closeOverlay;

  // === DROPDOWN ===
  const settingsToggle = overlay.querySelector("#settingsToggle");
  const settingsDropdown = overlay.querySelector("#settingsDropdown");
  const arrowIcon = overlay.querySelector("#arrowIcon");
  settingsToggle.onclick = () => {
    settingsDropdown.classList.toggle("hidden");
    arrowIcon.classList.toggle("rotate-180");
  };

  // === INTERACTIVE ===
  overlay.querySelector("#btnSettings").onclick = () => location.href = "./settings.html";
  overlay.querySelector("#btnPayments").onclick = () => location.href = "./payments.html";
  overlay.querySelector("#btnAccess").onclick = () => location.href = "./beta.html";

  overlay.querySelector("#btnDarkMode").onclick = () => {
    const dark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("machaDarkMode", dark);
  };

  overlay.querySelector("#btnLanguage").onclick = () => {
    const lang = prompt("Pilih Bahasa: id / en", localStorage.getItem("machaLang") || "id");
    if (lang) {
      localStorage.setItem("machaLang", lang.toLowerCase());
      alert("Bahasa diubah ke: " + lang);
    }
  };

  overlay.querySelector("#btnClean").onclick = () => {
    if (confirm("Bersihkan cache dan data lokal?")) {
      localStorage.clear();
      caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
      alert("Cache dibersihkan!");
      location.reload();
    }
  };

  overlay.querySelector("#logoutMenu").onclick = () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.click();
  };
}
