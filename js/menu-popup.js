// ============================
// MENU POPUP WITH SETTINGS + INTERACTIVE (v4)
// ============================

const menuBtn = document.getElementById("menuBtn");
const menuPopup = document.getElementById("menuPopup");

if (menuBtn && menuPopup) {
  menuPopup.innerHTML = `
    <div class="menu-header">
      <button class="menu-back" id="backMenu" title="Kembali">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <h2>Menu</h2>
      <div class="menu-close" id="closeMenu" title="Tutup">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </div>
    </div>

    <div class="profile-box">
      <img src="https://ui-avatars.com/api/?name=User" class="profile-img" id="profileImg" alt="Profile"/>
      <div class="profile-info">
        <h3 id="profileName">Pengguna</h3>
        <p class="underline text-indigo-400 cursor-pointer hover:text-indigo-300">Lihat profil Anda</p>
      </div>
    </div>

    <div class="menu-grid">
      <div class="menu-item"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9.75 12 4l9 5.75V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.75z"/></svg><span>Beranda</span></div>
      <div class="menu-item"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v8m-4-4h8"/></svg><span>Postingan</span></div>
      <div class="menu-item"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m4 0V9a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v8m12 0H5"/></svg><span>Grup</span></div>
      <div class="menu-item"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14m0-4v4M6 6h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/></svg><span>Live</span></div>
      <div class="menu-item"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18l-2 13H5L3 7zM16 3H8v4h8V3z"/></svg><span>Store</span></div>
      <div class="menu-item"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.75 4.75l14.5 14.5m0-14.5L4.75 19.25"/></svg><span>Reels</span></div>
    </div>

    <div class="menu-footer">
      <button id="settingsToggle" class="flex items-center gap-2 w-full text-left text-indigo-400 hover:text-indigo-300 transition">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2"/></svg> 
        Pengaturan & Privasi
        <svg id="arrowIcon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-4 h-4 ml-auto transition-transform"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9l6 6 6-6"/></svg>
      </button>

      <div id="settingsDropdown" class="hidden ml-6 mt-3 space-y-2 text-slate-300 text-sm transition-all duration-500">
        <button id="btnSettings" class="flex items-center gap-2 hover:text-indigo-300"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2"/></svg> Pengaturan</button>
        <button id="btnPayments" class="flex items-center gap-2 hover:text-indigo-300"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h18v4H3zM3 7h18v13H3z"/></svg> Pesanan & Pembayaran</button>
        <button id="btnDarkMode" class="flex items-center gap-2 hover:text-indigo-300"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.79A9 9 0 1 1 12 3v9h9z"/></svg> Mode Gelap</button>
        <button id="btnLanguage" class="flex items-center gap-2 hover:text-indigo-300"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h18M9 3v2m6-2v2M3 10h18m-9 4v7"/></svg> Bahasa</button>
        <button id="btnClean" class="flex items-center gap-2 hover:text-indigo-300"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5-4h4a1 1 0 0 1 1 1v1H9V4a1 1 0 0 1 1-1z"/></svg> Bersihkan Ruang</button>
        <button id="btnAccess" class="flex items-center gap-2 hover:text-indigo-300"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V9l7 4-7 4z"/></svg> Akses Awal</button>
      </div>

      <button class="mt-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h8m-8 4h5m1 5a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/></svg> Bantuan & Dukungan
      </button>
      <button class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> Tambahkan Akun</button>
      <button id="logoutMenu" class="flex items-center gap-2 text-red-400 hover:text-red-300"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H3m12 0l-4-4m4 4l-4 4"/></svg> Keluar</button>
    </div>
  `;

  // base
  menuBtn.addEventListener("click", () => menuPopup.classList.add("active"));
  document.getElementById("closeMenu").addEventListener("click", () => menuPopup.classList.remove("active"));
  document.getElementById("backMenu").addEventListener("click", () => menuPopup.classList.remove("active"));

  // dropdown
  const settingsToggle = document.getElementById("settingsToggle");
  const settingsDropdown = document.getElementById("settingsDropdown");
  const arrowIcon = document.getElementById("arrowIcon");
  settingsToggle.addEventListener("click", () => {
    settingsDropdown.classList.toggle("hidden");
    arrowIcon.classList.toggle("rotate-180");
  });

  // 🔧 interactive features
  document.getElementById("btnSettings").onclick = () => location.href = "./settings.html";
  document.getElementById("btnPayments").onclick = () => location.href = "./payments.html";
  document.getElementById("btnAccess").onclick = () => location.href = "./beta.html";

  // 🌙 dark mode toggle
  document.getElementById("btnDarkMode").onclick = () => {
    const dark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("machaDarkMode", dark);
  };
  if (localStorage.getItem("machaDarkMode") === "true") {
    document.documentElement.classList.add("dark");
  }

  // 🌐 bahasa
  document.getElementById("btnLanguage").onclick = () => {
    const lang = prompt("Pilih Bahasa: id / en", localStorage.getItem("machaLang") || "id");
    if (lang) {
      localStorage.setItem("machaLang", lang.toLowerCase());
      alert("Bahasa diubah ke: " + lang);
    }
  };

  // 🧹 bersihkan ruang
  document.getElementById("btnClean").onclick = () => {
    if (confirm("Bersihkan cache dan data lokal?")) {
      localStorage.clear();
      caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
      alert("Cache dibersihkan!");
      location.reload();
    }
  };

  // logout
  const logoutMenu = document.getElementById("logoutMenu");
  if (logoutMenu) logoutMenu.addEventListener("click", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.click();
  });
}
