// ==============================
// SPLASH SCREEN (v4 Elegant Glow)
// ==============================
export function initSplash(options = {}) {
  const duration = Number(options.duration ?? 4000); // total waktu tampil 4 detik

  // Buat elemen splash
  const splash = document.createElement("div");
  splash.id = "splash";
  splash.className =
    "fixed inset-0 z-[9999] flex items-center justify-center bg-[#060b18] overflow-hidden transition-all duration-700 opacity-0";

  splash.innerHTML = `
    <div class="text-center select-none">
      <h1 class="font-extrabold text-6xl sm:text-7xl tracking-[0.2em] text-transparent bg-clip-text 
                 bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 animate-glow">
        MACHA
      </h1>
    </div>
  `;
  document.body.appendChild(splash);

  // Style tambahan untuk animasi glow & fade
  const style = document.createElement("style");
  style.textContent = `
    @keyframes glowPulse {
      0%, 100% {
        filter: drop-shadow(0 0 20px rgba(255, 184, 108, 0.6))
                drop-shadow(0 0 40px rgba(255, 130, 130, 0.3));
        opacity: 1;
        transform: scale(1);
      }
      50% {
        filter: drop-shadow(0 0 35px rgba(255, 200, 140, 0.8))
                drop-shadow(0 0 65px rgba(255, 160, 160, 0.5));
        opacity: 0.9;
        transform: scale(1.04);
      }
    }

    .animate-glow {
      animation: glowPulse 3s ease-in-out infinite;
    }

    #splash.fade-in {
      opacity: 1;
      transform: scale(1);
    }
    #splash.fade-out {
      opacity: 0;
      transform: scale(1.05);
      filter: blur(8px);
    }
  `;
  document.head.appendChild(style);

  // Fade-in
  setTimeout(() => splash.classList.add("fade-in"), 100);

  // Fade-out menjelang akhir durasi
  setTimeout(() => {
    splash.classList.remove("fade-in");
    splash.classList.add("fade-out");
  }, duration - 1000);

  // Hapus setelah durasi berakhir
  setTimeout(() => splash.remove(), duration);
}
