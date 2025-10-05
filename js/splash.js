// /js/splash.js
// Splash dengan teks "MACHA CHAT" animasi mengetik + warna-warni
export function initSplash(options = {}) {
  const duration = Number(options.duration ?? 6000); // total tampil splash (ms)
  const fadeOut  = 800; // durasi fade-out CSS
  const text     = String(options.text ?? 'MACHA CHAT');

  const splash = document.createElement('div');
  splash.id = 'splash';
  splash.className =
    'fixed inset-0 z-[100] grid place-items-center bg-slate-950 text-white transition-opacity duration-700';

  splash.innerHTML = `
    <div class="text-center select-none">
      <h1 id="typingText" class="text-5xl sm:text-7xl font-extrabold tracking-widest">
        <span class="animate-gradient-text"></span><span id="caret" class="inline-block w-[6px] h-[2rem] bg-white/80 align-bottom ml-1"></span>
      </h1>
    </div>
  `;
  document.body.appendChild(splash);

  // Tambah gaya animasi gradasi dan caret
  const style = document.createElement('style');
  style.innerHTML = `
    .animate-gradient-text {
      background-image: linear-gradient(
        -45deg,
        #ff0080,
        #ff8c00,
        #40e0d0,
        #8a2be2,
        #ff0080
      );
      background-size: 400% 400%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: gradientFlow 5s ease infinite, glowPulse 2s ease-in-out infinite;
    }
    @keyframes gradientFlow {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes glowPulse {
      0%,100% { text-shadow: 0 0 10px rgba(255,255,255,0.5); }
      50% { text-shadow: 0 0 20px rgba(255,255,255,1); }
    }
    @keyframes caretBlink {
      0%,49%{opacity:1}
      50%,100%{opacity:0}
    }
    #caret {
      animation: caretBlink 800ms steps(1,end) infinite;
    }
  `;
  document.head.appendChild(style);

  // Efek mengetik
  const textTarget = splash.querySelector('.animate-gradient-text');
  const caret = splash.querySelector('#caret');
  const typeSpeed = Math.max(80, Math.floor(duration / Math.max(1, text.length * 3)));

  let i = 0;
  setTimeout(() => {
    (function type() {
      textTarget.textContent = text.slice(0, i++);
      if (i <= text.length) setTimeout(type, typeSpeed);
      else setTimeout(() => caret.style.opacity = '0', 600);
    })();
  }, 300);

  // Otomatis hilang setelah durasi total
  setTimeout(() => hideSplash(), duration);

  // Fungsi global untuk menutup manual
  window.hideSplash = function () {
    splash.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => splash.remove(), fadeOut);
  };
}
