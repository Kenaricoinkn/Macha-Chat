// ============================
// MENU POPUP SCRIPT (v3 FINAL SYNC)
// ============================

const menuBtn = document.getElementById('menuBtn');
const menuPopup = document.getElementById('menuPopup');

if (menuBtn && menuPopup) {
  // Inject HTML isi menu popup
  menuPopup.innerHTML = `
    <div class="menu-overlay">
      <div class="menu-container">
        <!-- Header -->
        <div class="menu-header">
          <button class="menu-back" id="backMenu" title="Kembali">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2>Menu</h2>
          <button class="menu-close" id="closeMenu" title="Tutup">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Profil -->
        <div class="profile-box">
          <img src="https://ui-avatars.com/api/?name=Pengguna&background=7C9BFF&color=fff" class="profile-img" id="profileImg" alt="Profile"/>
          <div class="profile-info">
            <h3 id="profileName">Pengguna</h3>
            <a href="#" class="profile-link">Lihat profil Anda</a>
          </div>
        </div>

        <!-- Grid Menu -->
        <div class="menu-grid">
          <div class="menu-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9.75 12 4l9 5.75V20H3z"/>
            </svg>
            <span>Beranda</span>
          </div>
          <div class="menu-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v8m-4-4h8"/>
            </svg>
            <span>Postingan</span>
          </div>
          <div class="menu-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m4 0V9a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v8m12 0H5"/>
            </svg>
            <span>Grup</span>
          </div>
          <div class="menu-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14m0-4v4M6 6h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/>
            </svg>
            <span>Live</span>
          </div>
          <div class="menu-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18l-2 13H5L3 7zM16 3H8v4h8V3z"/>
            </svg>
            <span>Store</span>
          </div>
          <div class="menu-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.75 4.75l14.5 14.5m0-14.5L4.75 19.25"/>
            </svg>
            <span>Reels</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="menu-footer">
          <button><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2"/></svg> Pengaturan & Privasi</button>
          <button><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h8m-8 4h5m1 5a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/></svg> Bantuan & Dukungan</button>
          <button><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> Tambahkan Akun</button>
          <button id="logoutMenu"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H3m12 0l-4-4m4 4l-4 4"/></svg> Keluar</button>
        </div>
      </div>
    </div>
  `;

  // Elemen kontrol
  const closeMenu = menuPopup.querySelector('#closeMenu');
  const backMenu = menuPopup.querySelector('#backMenu');
  const logoutMenu = menuPopup.querySelector('#logoutMenu');

  // Open
  menuBtn.addEventListener('click', () => menuPopup.classList.add('active'));

  // Close via tombol ❌ dan ⬅️
  [closeMenu, backMenu].forEach(btn =>
    btn.addEventListener('click', () => menuPopup.classList.remove('active'))
  );

  // Logout sinkron dengan dashboard
  if (logoutMenu) logoutMenu.addEventListener('click', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.click();
  });
}
