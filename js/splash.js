// ==============================
// SPLASH SCREEN (v5 FINAL)
// Elegant glow + typing + auto redirect (Firebase check)
// ==============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

export function initSplash() {
  const firebaseConfig = {
    apiKey: "AIzaSyDIsTmg0_-rcz9tH3U-_sZuWk7sUOLgMSw",
    authDomain: "macha-chat.firebaseapp.com",
    projectId: "macha-chat",
    storageBucket: "macha-chat.firebasestorage.app",
    messagingSenderId: "576142384286",
    appId: "1:576142384286:web:cfed000ac8a50b662a6f8f",
    measurementId: "G-6ZMFHMZVEK"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  const duration = 4000; // total 4 detik
  const typingText = "Created by Macha Team 💜";

  // Buat elemen splash
  const splash = document.createElement("div");
  splash.id = "splash";
  splash.className =
    "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#060b18] text-center text-slate-100 overflow-hidden opacity-0 transition-all duration-700";

  splash.innerHTML = `
    <h1 class="font-extrabold text-6xl sm:text-7xl tracking-[0.2em] text-transparent bg-clip-text 
               bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 animate-glow select-none">
      MACHA
    </h1>
    <div class="mt-4 text-slate-400 text-sm sm:text-base">
      <span id="typeText"></span><span id="cursor" class="inline-block w-[6px] h-[1.2em] bg-slate-300 ml-1"></span>
    </div>
  `;
  document.body.appendChild(splash);

  // Style tambahan untuk efek glow + animasi
  const style = document.createElement("style");
  style.textContent = `
    @keyframes glowPulse {
      0%, 100% {
        filter: drop-shadow(0 0 20px rgba(255, 184, 108, 0.6))
                drop-shadow(0 0 40px rgba(255, 130, 130, 0.3));
        transform: scale(1);
      }
      50% {
        filter: drop-shadow(0 0 35px rgba(255, 200, 140, 0.9))
                drop-shadow(0 0 65px rgba(255, 160, 160, 0.6));
        transform: scale(1.04);
      }
    }
    .animate-glow {
      animation: glowPulse 3s ease-in-out infinite;
    }
    #cursor {
      animation: blink 0.8s steps(1, end) infinite;
    }
    @keyframes blink {
      0%, 49% { opacity: 1; }
      50%, 100% { opacity: 0; }
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

  // Efek muncul
  setTimeout(() => splash.classList.add("fade-in"), 100);

  // Efek mengetik
  const typeEl = splash.querySelector("#typeText");
  const cursor = splash.querySelector("#cursor");
  let i = 0;
  const typeSpeed = 80;

  const type = () => {
    if (i < typingText.length) {
      typeEl.textContent += typingText.charAt(i);
      i++;
      setTimeout(type, typeSpeed);
    } else {
      cursor.style.opacity = "0.5";
    }
  };
  setTimeout(type, 600);

  // Fade-out menjelang akhir
  setTimeout(() => {
    splash.classList.remove("fade-in");
    splash.classList.add("fade-out");
  }, duration - 1000);

  // Setelah selesai splash → cek user Firebase
  setTimeout(() => {
    onAuthStateChanged(auth, (user) => {
      splash.remove();
      if (user) {
        window.location.href = "./dashboard.html";
      } else {
        window.location.href = "./login.html";
      }
    });
  }, duration);
}
