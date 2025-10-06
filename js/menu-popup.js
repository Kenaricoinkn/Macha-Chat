// ============================
// MENU POPUP POLISHED (v5.1 DOM-SAFE)
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

initializeApp(firebaseConfig);
getFirestore();

// Tunggu sampai DOM siap
window.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const menuPopup = document.getElementById("menuPopup");

  if (!menuBtn || !menuPopup) {
    console.warn("❌ Elemen menuBtn/menuPopup belum ditemukan.");
    return;
  }

  // Template popup
  menuPopup.innerHTML = `
    <div id="menuOverlay" class="fixed inset-0 hidden z-[99] bg-black/60 backdrop-blur-md flex justify-center items-start pt-8 opacity-0 transition-opacity duration-500">
      <div class="bg-[#0f142b]/95 w-11/12 max-w-md rounded-2xl shadow-lg border border-slate-700/50 text-slate-100 overflow-y-auto max-h-[90vh] animate-[slideUp_0.4s_ease]">
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

        <div class="flex items-center gap-3 px-5 py-4 border-b border-slate-700/40">
          <img src="https://ui-avatars.com/api/?name=User" class="w-12 h-12 rounded-full border border-slate-500" alt="Profile"/>
          <div>
            <h3 class="font-semibold text-slate-100 text-base">Pengguna</h3>
            <p class="text-sm underline text-indigo-400 hover:text-indigo-300 cursor-pointer">Lihat profil Anda</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 p-5">
          ${[
            ["Beranda","M3 9.75 12 4l9 5.75V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.75z"],
            ["Postingan","M12 8v8m-4-4h8"],
            ["Grup","M9 17v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m4 0V9a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v8m12 0H5"],
            ["Live","M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14m0-4v4M6 6h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"],
            ["Store","M3 7h18l-2 13H5L3 7zM16 3H8v4h8V3z"],
            ["Reels","M4.75 4.75l14.5 14.5m0-14.5L4.75 19.25"]
          ].map(([name,path])=>`
            <div class="bg-slate-800/50 hover:bg-indigo-600/40 transition p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-200 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${path}"/></svg>
              <span class="text-sm font-medium">${name}</span>
            </div>
          `).join("")}
        </div>

        <div class="px-5 pb-6 border-t border-slate-700/40 text-sm space-y-3">
          <button id="settingsToggle" class="flex items-center w-full gap-2 text-indigo-400 hover:text-indigo-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2"/>
            </svg>
            Pengaturan & Privasi
            <svg id="arrowIcon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-4 h-4 ml-auto transition-transform">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          <div id="settingsDropdown" class="hidden ml-6 mt-3 space-y-2 text-slate-300 text-[0.9rem]">
            <button class="flex items-center gap-2 hover:text-indigo-300">⚙️ Pengaturan</button>
            <button class="flex items-center gap-2 hover:text-indigo-300">💳 Pesanan & Pembayaran</button>
            <button id="btnDarkMode" class="flex items-center gap-2 hover:text-indigo-300">🌙 Mode Gelap</button>
            <button id="btnLanguage" class="flex items-center gap-2 hover:text-indigo-300">🌐 Bahasa</button>
            <button id="btnClean" class="flex items-center gap-2 hover:text-indigo-300">🧹 Bersihkan Ruang</button>
            <button class="flex items-center gap-2 hover:text-indigo-300">🚀 Akses Awal</button>
          </div>

          <button id="logoutMenu" class="flex items-center gap-2 text-red-400 hover:text-red-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H3m12 0l-4-4m4 4l-4 4"/>
            </svg> Keluar
          </button>
        </div>
      </div>
    </div>
  `;

  const overlay = document.getElementById("menuOverlay");
  const closeMenu = document.getElementById("closeMenu");
  const backMenu = document.getElementById("backMenu");
  const settingsToggle = document.getElementById("settingsToggle");
  const settingsDropdown = document.getElementById("settingsDropdown");
  const arrowIcon = document.getElementById("arrowIcon");

  // Buka popup
  menuBtn.onclick = () => {
    overlay.classList.remove("hidden");
    requestAnimationFrame(() => overlay.classList.remove("opacity-0"));
  };

  // Tutup popup
  const closeOverlay = () => {
    overlay.classList.add("opacity-0");
    setTimeout(() => overlay.classList.add("hidden"), 500);
  };
  closeMenu.onclick = closeOverlay;
  backMenu.onclick = closeOverlay;

  // Dropdown toggle
  settingsToggle.onclick = () => {
    settingsDropdown.classList.toggle("hidden");
    arrowIcon.classList.toggle("rotate-180");
  };

  // Mode gelap toggle
  const btnDarkMode = document.getElementById("btnDarkMode");
  btnDarkMode.onclick = () => {
    const dark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("machaDarkMode", dark);
  };

  // Bahasa
  const btnLanguage = document.getElementById("btnLanguage");
  btnLanguage.onclick = () => {
    const lang = prompt("Pilih Bahasa: id / en", localStorage.getItem("machaLang") || "id");
    if (lang) {
      localStorage.setItem("machaLang", lang.toLowerCase());
      alert("Bahasa diubah ke: " + lang);
    }
  };

  // Bersihkan cache
  const btnClean = document.getElementById("btnClean");
  btnClean.onclick = () => {
    if (confirm("Bersihkan cache dan data lokal?")) {
      localStorage.clear();
      caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
      alert("Cache dibersihkan!");
      location.reload();
    }
  };

  // Logout
  document.getElementById("logoutMenu").onclick = () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.click();
  };
});
