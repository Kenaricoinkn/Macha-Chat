// /js/splash.js
// Splash + typing sinkron; judul MACHA & Aepuloh gradient warna-warni (kedip)
export function initSplash(options = {}) {
  const duration = Number(options.duration ?? 10000); // total tampil splash (ms)
  const typeText = String(options.text ?? 'Created macha by Gojo Satoru');

  // timing
  const leadIn   = 400;   // jeda sebelum mulai mengetik
  const fadeOut  = 750;   // durasi fade-out CSS
  const tailHold = 600;   // diam sejenak setelah mengetik selesai

  const typingWindow = Math.max(800, duration - (leadIn + fadeOut + tailHold));
  const typeSpeed    = Math.max(15, Math.floor(typingWindow / Math.max(1, typeText.length)));

  const splash = document.createElement('div');
  splash.id = 'splash';
  splash.className =
    'fixed inset-0 z-[100] grid place-items-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-slate-100 transition-opacity duration-700';

  splash.innerHTML = `
    <div class="text-center px-6">
      <div class="text-4xl sm:text-6xl font-black leading-tight tracking-wide">
        <span class="animate-gradient bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 bg-clip-text text-transparent">
          MACHA
        </span>
        <span class="font-semibold">from</span>
        <span class="animate-gradient-2 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
          Aepuloh
        </span>
      </div>

      <div class="mt-3 text-base sm:text-lg text-slate-300 min-h-[1.8rem]">
        <span id="typing"></span>
        <span id="caret" class="inline-block w-3 h-5 align-middle bg-slate-200/80 ml-1"></span>
      </div>

      <div class="mt-8 flex items-center justify-center gap-1 text-slate-400">
        <div class="w-2 h-2 rounded-full bg-slate-500 animate-bounce [animation-delay:-200ms]"></div>
        <div class="w-2 h-2 rounded-full bg-slate-500 animate-bounce [animation-delay:-100ms]"></div>
        <div class="w-2 h-2 rounded-full bg-slate-500 animate-bounce"></div>
      </div>
    </div>
  `;
  document.body.appendChild(splash);

  // Animasi gradien & kedip
  const style = document.createElement('style');
  style.innerHTML = `
    .animate-gradient {
      background-size: 300% 300%;
      animation: gradientMove 5s ease infinite, blinkSoft 2.2s ease-in-out infinite;
    }
    .animate-gradient-2 {
      background-size: 300% 300%;
      animation: gradientMove2 5.5s ease infinite, blinkSoft 2.2s ease-in-out infinite;
    }
    @keyframes gradientMove {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes gradientMove2 {
      0% { background-position: 100% 50%; }
      50% { background-position: 0% 50%; }
      100% { background-position: 100% 50%; }
    }
    @keyframes blinkSoft {
      0%,100% { opacity: 1; }
      50%     { opacity: .78; }
    }
    #caret { animation: caretBlink 800ms steps(1,end) infinite; }
    @keyframes caretBlink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
  `;
  document.head.appendChild(style);

  // efek mengetik (sinkron dengan duration)
  const el = splash.querySelector('#typing');
  const caret = splash.querySelector('#caret');

  setTimeout(() => {
    let i = 0;
    (function type() {
      el.textContent = typeText.slice(0, i++);
      if (i <= typeText.length) setTimeout(type, typeSpeed);
      else setTimeout(() => { caret.style.opacity = '0'; }, tailHold);
    })();
  }, leadIn);

  // fungsi global hide (kalau mau tutup manual)
  window.hideSplash = function () {
    splash.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => splash.remove(), fadeOut);
  };
}
