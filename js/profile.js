import { auth, db } from "./config.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  doc, getDoc, setDoc, serverTimestamp, collection, addDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Elemen
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userPhoto = document.getElementById("userPhoto");
const chatNow = document.getElementById("chatNow");
const addFriend = document.getElementById("addFriend");

// Ambil UID dari URL
const params = new URLSearchParams(window.location.search);
const uid = params.get("uid");
if (!uid) window.location.href = "./friends.html";

let currentUser = null;

// Autentikasi
onAuthStateChanged(auth, async (user) => {
  if (!user) return (window.location.href = "./login.html");
  currentUser = user;
  loadProfile(uid);
});

// 🔍 Ambil data profil dari Firestore
async function loadProfile(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    userName.textContent = "Pengguna Tidak Ditemukan";
    return;
  }

  const data = snap.data();
  userName.textContent = data.name || "Tanpa Nama";
  userEmail.textContent = data.email || "";
  if (data.photoURL) userPhoto.src = data.photoURL;
}

// 💬 Chat Sekarang
chatNow.addEventListener("click", () => {
  window.location.href = `./chat.html?uid=${uid}`;
});

// ➕ Tambah Teman
addFriend.addEventListener("click", async () => {
  if (uid === currentUser.uid) return alert("Tidak bisa menambahkan diri sendiri!");

  try {
    await addDoc(collection(db, "friendRequests"), {
      from: currentUser.email,
      fromName: currentUser.displayName || "Pengguna",
      to: userEmail.textContent,
      toUid: uid,
      createdAt: serverTimestamp(),
      status: "pending"
    });
    alert("Permintaan pertemanan dikirim!");
  } catch (err) {
    console.error(err);
    alert("Gagal mengirim permintaan.");
  }
});
