import { auth, db } from "./config.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  collection, addDoc, query, orderBy, onSnapshot, doc, setDoc, getDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Elemen DOM
const chatBox = document.getElementById("chatBox");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const chatWithEl = document.getElementById("chatWith");

// Ambil UID target dari URL
const urlParams = new URLSearchParams(window.location.search);
const targetUid = urlParams.get("uid");
if (!targetUid) window.location.href = "./friends.html";

let currentUser = null;
let chatId = null;

// 🔥 Autentikasi
onAuthStateChanged(auth, async (user) => {
  if (!user) return (window.location.href = "./login.html");
  currentUser = user;

  // Cek kombinasi ID unik untuk chat
  chatId = user.uid < targetUid ? `${user.uid}_${targetUid}` : `${targetUid}_${user.uid}`;

  // Pastikan dokumen chat ada
  const chatDoc = doc(db, "chats", chatId);
  const snap = await getDoc(chatDoc);
  if (!snap.exists()) {
    await setDoc(chatDoc, { members: [user.uid, targetUid], createdAt: serverTimestamp() });
  }

  // Tampilkan nama lawan chat di header
  const userSnap = await getDoc(doc(db, "users", targetUid));
  chatWithEl.textContent = userSnap.exists() ? userSnap.data().name : "Pengguna";

  // Jalankan listener pesan
  listenMessages();
});

// 🧠 Fungsi real-time listener
function listenMessages() {
  const msgsRef = collection(db, "chats", chatId, "messages");
  const q = query(msgsRef, orderBy("createdAt"));
  onSnapshot(q, (snapshot) => {
    chatBox.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      const div = document.createElement("div");
      div.className = "msg " + (data.from === currentUser.uid ? "me" : "you");
      div.textContent = data.text;
      chatBox.appendChild(div);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// 📨 Kirim pesan
sendBtn.onclick = async () => {
  const text = msgInput.value.trim();
  if (!text) return;

  await addDoc(collection(db, "chats", chatId, "messages"), {
    text,
    from: currentUser.uid,
    createdAt: serverTimestamp(),
  });

  msgInput.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;
};
