// /js/splash.js
export function initSplash() {
  const splash = document.createElement('div');
  splash.id = 'splash';
  splash.className =
    'fixed inset-0 z-[100] grid place-items-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-slate-100 transition-opacity duration-700';

  splash.innerHTML = `
    <div class="text-center px-6">
      <!-- Logo MACHA warna pelangi -->
      <div class="text-4xl sm:text-6xl font-black tracking-wide">
        <span class="animate-gradient bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 bg-clip-text text-transparent">
          MACHA
        </span>
        <span class="font-semibold">from</span> Aepuloh
      </div>

      <!-- subtitle dengan efek mengetik -->
      <div class="mt-3 text-base sm:text-lg text-slate-300 min-h-[1.8rem]">
        <span id="typing"></span>
        <span class="inline-block w-3 h-5 align-middle bg-slate-200/80 animate-pulse ml-1"></span>
      </div>

      <!-- titik loading -->
      <div class="mt-8 flex items-center justify-center gap-1 text-slate-400">
        <div class="w-2 h-2 rounded-full bg-slate-500 animate-bounce [animation-delay:-200ms]"></div>
        <div class="w-2 h-2 rounded-full bg-slate-500 animate-bounce [animation-delay:-100ms]"></div>
        <div class="w-2 h-2 rounded-full bg-slate-500 animate-bounce"></div>
      </div>
    </div>
  `;

  document.body.appendChild(splash);

  // animasi gradient (Tailwind + custom)
  const style = document.createElement('style');
  style.innerHTML = `
    .animate-gradient {
      background-size: 300% 300%;
      animation: gradientMove 5s ease infinite;
    }
    @keyframes gradientMove {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;
  document.head.appendChild(style);

  // efek mengetik
  const typing = splash.querySelector('#typing');
  const text = 'Created macha by Gojo Satoru';
  let i = 0;
  const speed = 60;
  (function type() {
    typing.textContent = text.slice(0, i++);
    if (i <= text.length) setTimeout(type, speed);
  })();

  // fungsi global hideSplash
  window.hideSplash = function () {
    splash.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => splash.remove(), 750);
  };

  // fallback otomatis (10 detik)
  setTimeout(() => window.hideSplash?.(), 10000);
}
