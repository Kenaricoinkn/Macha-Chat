import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase config
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
const db = getFirestore(app);

const adminPanel = document.getElementById("adminPanel");
const adminStatus = document.getElementById("adminStatus");
const menuList = document.getElementById("menuList");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    adminStatus.innerHTML = `<span class="text-red-400">Anda belum login!</span>`;
    return;
  }
  if (user.email !== "anjaniselalu76@gmail.com") {
    adminStatus.innerHTML = `<span class="text-red-400">Akses ditolak ❌</span>`;
    return;
  }

  adminStatus.classList.add("hidden");
  adminPanel.classList.remove("hidden");

  loadMenuList();
});

async function loadMenuList() {
  menuList.innerHTML = `<p class="text-slate-400 text-center">Memuat menu...</p>`;
  const snap = await getDocs(collection(db, "menu_items"));
  menuList.innerHTML = "";
  snap.forEach((d) => {
    const item = d.data();
    const el = document.createElement("div");
    el.className = "flex items-center justify-between bg-slate-900/50 p-3 rounded-lg";
    el.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 text-brand">${item.icon}</div>
        <span>${item.name}</span>
      </div>
      <button data-id="${d.id}" class="deleteBtn text-red-400 hover:text-red-300">Hapus</button>
    `;
    menuList.appendChild(el);
  });

  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      await deleteDoc(doc(db, "menu_items", btn.dataset.id));
      loadMenuList();
    });
  });
}

document.getElementById("addMenuBtn").addEventListener("click", async () => {
  const name = document.getElementById("menuName").value.trim();
  const icon = document.getElementById("menuIcon").value.trim();
  const link = document.getElementById("menuLink").value.trim();
  if (!name || !icon) return alert("Nama & ikon wajib diisi!");
  await addDoc(collection(db, "menu_items"), { name, icon, link });
  document.getElementById("menuName").value = "";
  document.getElementById("menuIcon").value = "";
  document.getElementById("menuLink").value = "";
  loadMenuList();
});
