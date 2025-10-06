import { auth, db } from "./config.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  collection, query, where, onSnapshot, doc, deleteDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const friendsList = document.getElementById("friendsList");

onAuthStateChanged(auth, (user) => {
  if (!user) return (window.location.href = "./login.html");
  loadFriendRequests(user.email);
});

function loadFriendRequests(email) {
  const q = query(collection(db, "friendRequests"), where("to", "==", email));
  onSnapshot(q, (snapshot) => {
    friendsList.innerHTML = "";

    if (snapshot.empty) {
      friendsList.innerHTML = `<p class='text-slate-400 text-sm'>Tidak ada permintaan pertemanan 😄</p>`;
      return;
    }

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const card = document.createElement("div");
      card.className = "card flex items-center justify-between";

      card.innerHTML = `
        <div class="flex items-center gap-3">
          <img src="${data.photoURL || "https://ui-avatars.com/api/?name=" + data.from}" class="avatar" alt="avatar">
          <div>
            <h3 class="font-semibold">${data.fromName || data.from}</h3>
            <p class="text-sm text-slate-400">${data.mutual || 0} teman bersama</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-confirm">Konfirmasi</button>
          <button class="btn btn-delete">Hapus</button>
        </div>
      `;

      const btnConfirm = card.querySelector(".btn-confirm");
      const btnDelete = card.querySelector(".btn-delete");

      btnConfirm.addEventListener("click", async () => {
        await updateDoc(doc(db, "friendRequests", docSnap.id), { status: "accepted" });
      });

      btnDelete.addEventListener("click", async () => {
        await deleteDoc(doc(db, "friendRequests", docSnap.id));
      });

      friendsList.appendChild(card);
    });
  });
}
