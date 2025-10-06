// ============================
// MACHA MENU POPUP — FINAL v6.2
// Fullscreen + Firebase Sync + Interactive
// ============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDIsTmg0_-rcz9tH3U-_sZuWk7sUOLgMSw",
  authDomain: "macha-chat.firebaseapp.com",
  projectId: "macha-chat",
  storageBucket: "macha-chat.firebasestorage.app",
  messagingSenderId: "576142384286",
  appId: "1:576142384286:web:cfed000ac8a50b662a6f8f",
  measurementId: "G-6ZMFHMZVEK"
};

// Inisialisasi Firebase (hanya 1x)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

window.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const menuPopup = document.getElementById("menuPopup");
  if (!menuBtn || !menuPopup) return console.warn("⚠️ menuBtn/menuPopup tidak ditemukan");

  // Template popup fullscreen
  menuPopup.innerHTML = `
    <div id="menuOverlay"
      class="fixed inset-0 hidden z-[99] bg-black/60 backdrop-blur-lg flex justify-center items-end opacity-0 transition-opacity duration-500">
      <div class="w-full h-[95vh] bg-[#0b1020]/95 rounded-t-3xl shadow-2xl border-t border-slate-700/40 overflow-y-auto animate-[slideUp_0.4s_ease] text-slate-100">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-3 border-b border-slate-600/40 bg-[#101630]/60 backdrop-blur-md">
          <button id="backMenu" class="text-slate-300 hover:text-indigo-400 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 class="text-lg font-bold text-indigo-300 tracking-wide">Menu</h2>
          <button id="closeMenu" class="text-slate-300 hover:text-red-400 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Profil -->
        <div class="flex items-center gap-3 px-6 py-4 border-b border-slate-700/40">
          <img id="profileImg" src="https://ui-avatars.com/api/?name=User"
            class="w-12 h-12 rounded-full border border-slate-500 shadow-md" alt="Profile"/>
          <div>
            <h3 id="profileName" class="font-semibold text-slate-100 text-base">Pengguna</h3>
            <a href="./profile.html" class="text-sm underline text-indigo-400 hover:text-indigo-300 cursor-pointer">Lihat profil Anda</a>
          </div>
        </div>

        <!-- Grid menu utama -->
        <div class="grid grid-cols-2 gap-3 p-6">
          ${[
            ["Beranda","🏠"],["Postingan","➕"],["Grup","👥"],
            ["Live","🎥"],["Store","🛒"],["Reels","🎞️"]
          ].map(([name,icon])=>`
            <div class="bg-slate-800/40 hover:bg-indigo-600/40 transition p-4 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-200 cursor-pointer font-medium shadow-[0_0_8px_rgba(124,155,255,0.15)]">
              <span class="text-2xl">${icon}</span>
              <span class="text-sm">${name}</span>
            </div>
          `).join("")}
        </div>

        <!-- Pengaturan & Privasi -->
        <div class="px-6 pb-6 border-t border-slate-700/40 space-y-3 text-sm">
          <button id="settingsToggle" class="flex items-center w-full gap-2 text-indigo-400 hover:text-indigo-300">
            ⚙️ Pengaturan & Privasi
            <svg id="arrowIcon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
              class="w-4 h-4 ml-auto transition-transform"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9l6 6 6-6"/></svg>
          </button>

          <div id="settingsDropdown" class="hidden ml-4 mt-3 space-y-2 text-slate-300 text-[0.9rem]">
            <button id="btnSettings" class="block w-full text-left hover:text-indigo-300">🛠 Pengaturan</button>
            <button id="btnPayments" class="block w-full text-left hover:text-indigo-300">💳 Pesanan & Pembayaran</button>
            <button id="btnDarkMode" class="block w-full text-left hover:text-indigo-300">🌙 Mode Gelap</button>
            <button id="btnLanguage" class="block w-full text-left hover:text-indigo-300">🌐 Bahasa</button>
            <button id="btnClean" class="block w-full text-left hover:text-indigo-300">🧹 Bersihkan Ruang</button>
            <button id="btnAccess" class="block w-full text-left hover:text-indigo-300">🚀 Akses Awal</button>
          </div>

          <hr class="border-slate-700/30">

          <button id="btnHelp" class="flex items-center gap-2 text-indigo-400 hover:text-indigo-300">💬 Bantuan & Dukungan</button>
          <button id="btnAddAcc" class="flex items-center gap-2 text-indigo-400 hover:text-indigo-300">➕ Tambahkan Akun</button>
          <button id="logoutMenu" class="flex items-center gap-2 text-red-400 hover:text-red-300">↩️ Keluar</button>
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

  // Buka / Tutup popup
  menuBtn.onclick = () => {
    overlay.classList.remove("hidden");
    requestAnimationFrame(() => overlay.classList.remove("opacity-0"));
  };
  const closeOverlay = () => {
    overlay.classList.add("opacity-0");
    setTimeout(() => overlay.classList.add("hidden"), 400);
  };
  closeMenu.onclick = closeOverlay;
  backMenu.onclick = closeOverlay;
  overlay.addEventListener("click", e => { if (e.target.id === "menuOverlay") closeOverlay(); });

  // Dropdown toggle
  settingsToggle.onclick = () => {
    settingsDropdown.classList.toggle("hidden");
    arrowIcon.classList.toggle("rotate-180");
  };

  // Mode gelap toggle
  document.getElementById("btnDarkMode").onclick = () => {
    const dark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("machaDarkMode", dark);
  };
  if (localStorage.getItem("machaDarkMode") === "true") {
    document.documentElement.classList.add("dark");
  }

  // Bahasa
  document.getElementById("btnLanguage").onclick = () => {
    const lang = prompt("Pilih Bahasa: id / en", localStorage.getItem("machaLang") || "id");
    if (lang) {
      localStorage.setItem("machaLang", lang.toLowerCase());
      alert("Bahasa diubah ke: " + lang);
    }
  };

  // Bersihkan cache
  document.getElementById("btnClean").onclick = () => {
    if (confirm("Bersihkan cache dan data lokal?")) {
      localStorage.clear();
      caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
      alert("Cache dibersihkan!");
      location.reload();
    }
  };

  // Akses awal
  document.getElementById("btnAccess").onclick = () => {
    window.location.href = "./beta.html";
  };

  // Halaman pengaturan & pembayaran
  document.getElementById("btnSettings").onclick = () => window.location.href = "./settings.html";
  document.getElementById("btnPayments").onclick = () => window.location.href = "./payments.html";

  // Logout
  document.getElementById("logoutMenu").onclick = async () => {
    await signOut(auth);
    localStorage.clear();
    window.location.href = "./login.html";
  };

  // Sinkronisasi user
  onAuthStateChanged(auth, (user) => {
    if (user) {
      document.getElementById("profileName").textContent = user.displayName || "Pengguna";
      document.getElementById("profileImg").src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}`;
    }
  });
});
