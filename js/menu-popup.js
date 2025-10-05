// menu-popup.js
export function initMenuPopup() {
  const popup = document.getElementById("menuPopup");

  // HTML konten menu
  popup.innerHTML = `
    <div class="menu-close" id="closeMenu">✕</div>
    <h2 class="menu-title">Menu Utama</h2>
    <div class="menu-grid">
      ${getMenuItem("👤", "Profil")}
      ${getMenuItem("💬", "Chat")}
      ${getMenuItem("🎥", "Live Streaming")}
      ${getMenuItem("🎉", "Reels")}
      ${getMenuItem("👥", "Grup")}
      ${getMenuItem("🔔", "Notifikasi")}
      ${getMenuItem("⚙️", "Pengaturan")}
      ${getMenuItem("🚪", "Keluar")}
    </div>
  `;

  // Fungsi bantu untuk menu item
  function getMenuItem(icon, label) {
    return `
      <div class="menu-item">
        <div class="text-3xl">${icon}</div>
        <span>${label}</span>
      </div>`;
  }

  // buka / tutup menu
  const openBtn = document.getElementById("menuBtn");
  const closeBtn = popup.querySelector("#closeMenu");

  openBtn.addEventListener("click", () => {
    popup.classList.add("show");
  });
  closeBtn.addEventListener("click", () => {
    popup.classList.remove("show");
  });

  // Klik di luar area close menu
  popup.addEventListener("click", (e) => {
    if (e.target === popup) popup.classList.remove("show");
  });
}

// auto-init
window.addEventListener("DOMContentLoaded", initMenuPopup);
