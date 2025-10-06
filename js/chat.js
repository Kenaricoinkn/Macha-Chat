// js/chat.js
import { db, auth } from "./config.js";
import {
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const chatList = document.getElementById("chatList");
const chatRoom = document.getElementById("chatRoom");
const chatBox = document.getElementById("chatBox");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const backBtn = document.getElementById("backBtn");
const userEmailEl = document.getElementById("userEmail");
const newChatBtn = document.getElementById("newChatBtn");

let currentUser = null;
let activeFriend = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) return (window.location.href = "./login.html");
  currentUser = user;
  userEmailEl.textContent = user.email;
  loadChatList();
});

async function loadChatList() {
  const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    const seen = new Set();
    chatList.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.email === currentUser.email) return;
      if (!seen.has(data.email)) {
        seen.add(data.email);
        const el = document.createElement("div");
        el.className =
          "flex items-center gap-3 p-3 bg-slate-800/40 hover:bg-indigo-600/30 rounded-xl mb-2 cursor-pointer transition";
        el.innerHTML = `
          <div class="w-10 h-10 rounded-full bg-gradient-to-r from-brand to-brand2 flex items-center justify-center font-semibold text-white">
            ${data.email[0].toUpperCase()}
          </div>
          <div>
            <p class="font-semibold text-slate-100 text-sm">${data.email}</p>
            <p class="text-xs text-slate-400">${data.text || "Pesan terakhir..."}</p>
          </div>`;
        el.addEventListener("click", () => openChat(data.email));
        chatList.appendChild(el);
      }
    });
  });
}

function openChat(friendEmail) {
  activeFriend = friendEmail;
  chatList.classList.add("hidden");
  chatRoom.classList.remove("hidden");
  loadMessages(friendEmail);
}

function loadMessages(friendEmail) {
  const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
  onSnapshot(q, (snapshot) => {
    chatBox.innerHTML = "";
    snapshot.forEach((doc) => {
      const d = doc.data();
      const involved =
        (d.email === currentUser.email && d.to === friendEmail) ||
        (d.email === friendEmail && d.to === currentUser.email);
      if (!involved) return;

      const msg = document.createElement("div");
      const isMine = d.email === currentUser.email;
      msg.className = `flex ${isMine ? "justify-end" : "justify-start"} mb-3`;
      msg.innerHTML = `
        <div class="max-w-[75%] p-3 rounded-2xl ${
          isMine
            ? "bg-gradient-to-r from-brand to-brand2 text-white rounded-br-none"
            : "bg-slate-800/70 text-slate-100 border border-slate-700/50 rounded-bl-none"
        }">
          <p class="text-sm">${d.text}</p>
        </div>`;
      chatBox.appendChild(msg);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

sendBtn.addEventListener("click", async () => {
  const text = msgInput.value.trim();
  if (!text || !activeFriend) return;
  await addDoc(collection(db, "messages"), {
    email: currentUser.email,
    to: activeFriend,
    text,
    createdAt: serverTimestamp(),
  });
  msgInput.value = "";
});

msgInput.addEventListener("keydown", (e) => e.key === "Enter" && sendBtn.click());
backBtn.addEventListener("click", () => {
  chatRoom.classList.add("hidden");
  chatList.classList.remove("hidden");
});

newChatBtn.addEventListener("click", () => {
  const email = prompt("Masukkan email teman untuk mulai chat:");
  if (email && email.includes("@")) openChat(email);
});
