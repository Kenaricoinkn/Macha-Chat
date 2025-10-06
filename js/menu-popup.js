// ============================
// MACHA MENU POPUP — FINAL FIX v6 (works in Vercel)
// ============================

document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  if (!menuBtn) {
    console.warn("⚠️ menuBtn tidak ditemukan di DOM.");
    return;
  }

  // Buat elemen overlay popup langsung di body
  const overlay = document.createElement("div");
  overlay.id = "menuOverlay";
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,.45);
    backdrop-filter:blur(6px);display:flex;align-items:flex-end;
    justify-content:center;opacity:0;pointer-events:none;
    transition:opacity .3s ease;z-index:9999;
  `;

  const panel = document.createElement("div");
  panel.id = "menuPanel";
  panel.style.cssText = `
    background:#0b1020;width:100%;max-width:420px;
    border-radius:1.2rem 1.2rem 0 0;
    box-shadow:0 0 25px #7C9BFF44;
    transform:translateY(100%);
    transition:transform .35s ease;
    color:#f1f5f9;
  `;

  // Isi konten popup
  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:1rem;border-bottom:1px solid rgba(255,255,255,.1)">
      <button id="menuBack" style="color:#94a3b8">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="26" height="26">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <h2 style="font-weight:700;font-size:1.1rem;color:#a78bfa;">Menu</h2>
      <button id="menuClose" style="color:#94a3b8">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="26" height="26">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <div style="padding:1.2rem">
      <div style="display:flex;align-items:center;gap:.8rem;margin-bottom:1rem">
        <img src="https://ui-avatars.com/api/?name=User" width="48" height="48" style="border-radius:50%;border:1px solid rgba(167,139,250,.3)">
        <div>
          <p style="font-weight:600;">Pengguna</p>
          <a href="./profile.html" style="color:#a78bfa;font-size:.9rem;text-decoration:underline;">Lihat profil Anda</a>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:.8rem;">
        ${["Beranda","Postingan","Grup","Live","Store","Reels"].map(name=>`
          <button style="padding:1rem;border-radius:.8rem;background:rgba(255,255,255,.05);color:#e2e8f0;font-weight:500;font-size:.9rem;transition:.25s;">
            ${name}
          </button>`).join("")}
      </div>

      <hr style="margin:1rem 0;border-color:rgba(255,255,255,.1)">
      
      <button id="toggleSettings" style="display:flex;align-items:center;justify-content:space-between;width:100%;color:#a78bfa;font-weight:600">
        <span>⚙️ Pengaturan & Privasi</span>
        <span id="arrowIcon">▼</span>
      </button>

      <div id="settingsDropdown" style="display:none;margin-top:.6rem;margin-left:.8rem;font-size:.9rem;color:#cbd5e1">
        <button class="dropdownItem">🛠 Pengaturan</button><br>
        <button class="dropdownItem">💳 Pesanan & Pembayaran</button><br>
        <button id="darkModeBtn" class="dropdownItem">🌙 Mode Gelap</button><br>
        <button class="dropdownItem">🌐 Bahasa</button><br>
        <button class="dropdownItem">🧹 Bersihkan Ruang</button><br>
        <button class="dropdownItem">🚀 Akses Awal</button>
      </div>

      <hr style="margin:1rem 0;border-color:rgba(255,255,255,.1)">

      <div style="display:flex;flex-direction:column;gap:.6rem;">
        <button style="color:#a5b4fc;text-align:left;">💬 Bantuan & Dukungan</button>
        <button style="color:#a5b4fc;text-align:left;">➕ Tambahkan Akun</button>
        <button id="logoutMenu" style="color:#f87171;text-align:left;">↩️ Keluar</button>
      </div>
    </div>
  `;

  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  // Fungsi buka / tutup
  const openMenu = () => {
    overlay.style.opacity = "1";
    overlay.style.pointerEvents = "auto";
    panel.style.transform = "translateY(0)";
  };
  const closeMenu = () => {
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
    panel.style.transform = "translateY(100%)";
  };

  // Klik event
  menuBtn.addEventListener("click", openMenu);
  overlay.addEventListener("click", (e) => { if (e.target.id === "menuOverlay") closeMenu(); });
  panel.querySelector("#menuClose").addEventListener("click", closeMenu);
  panel.querySelector("#menuBack").addEventListener("click", closeMenu);

  // Dropdown pengaturan
  const settingsBtn = panel.querySelector("#toggleSettings");
  const dropdown = panel.querySelector("#settingsDropdown");
  const arrow = panel.querySelector("#arrowIcon");

  settingsBtn.addEventListener("click", () => {
    const show = dropdown.style.display === "none";
    dropdown.style.display = show ? "block" : "none";
    arrow.textContent = show ? "▲" : "▼";
  });

  // Mode gelap
  const darkBtn = panel.querySelector("#darkModeBtn");
  darkBtn.addEventListener("click", () => {
    const dark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("machaDarkMode", dark);
  });
  if (localStorage.getItem("machaDarkMode") === "true") {
    document.documentElement.classList.add("dark");
  }

  // Logout
  const logoutMenu = panel.querySelector("#logoutMenu");
  logoutMenu.addEventListener("click", () => {
    const btn = document.getElementById("logoutBtn");
    if (btn) btn.click();
  });
});
