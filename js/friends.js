import { auth, db } from "./config.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  collection, query, where, onSnapshot, doc, deleteDoc, updateDoc, addDoc, setDoc, getDocs
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 📦 Elemen target
const friendsList = document.getElementById("friendsList");
const myFriendsList = document.getElementById("myFriendsList");
const suggestList = document.getElementById("suggestList");

// 🧠 Start listener
onAuthStateChanged(auth, (user) => {
  if (!user) return (window.location.href = "./login.html");
  const email = user.email;

  loadFriendRequests(email);
  loadFriends(email);
  loadSuggestions(email);
});


// =======================
// 🔹 1. Permintaan Pertemanan
// =======================
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
      card.className =
        "card flex items-center justify-between hover:shadow-indigo-500/10";

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

      // Konfirmasi → tambah ke koleksi "friends"
      btnConfirm.addEventListener("click", async () => {
        await setDoc(doc(db, "friends", `${data.from}_${data.to}`), {
          userA: data.from,
          userB: data.to,
          createdAt: Date.now(),
        });
        await updateDoc(doc(db, "friendRequests", docSnap.id), { status: "accepted" });
      });

      // Hapus request
      btnDelete.addEventListener("click", async () => {
        await deleteDoc(doc(db, "friendRequests", docSnap.id));
      });

      friendsList.appendChild(card);
    });
  });
}


// =======================
// 🔹 2. Daftar Teman Aktif
// =======================
function loadFriends(email) {
  const q = query(collection(db, "friends"));
  onSnapshot(q, (snapshot) => {
    myFriendsList.innerHTML = "";

    const userFriends = snapshot.docs
      .map((d) => d.data())
      .filter((d) => d.userA === email || d.userB === email);

    if (userFriends.length === 0) {
      myFriendsList.innerHTML = `<p class='text-slate-400 text-sm'>Belum ada teman 😅</p>`;
      return;
    }

    userFriends.forEach((f) => {
      const friendEmail = f.userA === email ? f.userB : f.userA;
      const div = document.createElement("div");
      div.className = "card flex items-center justify-between";

      div.innerHTML = `
        <div class="flex items-center gap-3">
          <img src="https://ui-avatars.com/api/?name=${friendEmail}" class="avatar" alt="friend"/>
          <div>
            <h3 class="font-semibold">${friendEmail}</h3>
            <p class="text-sm text-slate-400">Teman terhubung</p>
          </div>
        </div>
        <button class="btn btn-delete text-sm">Hapus</button>
      `;

      div.querySelector(".btn-delete").addEventListener("click", async () => {
        const id = `${f.userA}_${f.userB}`;
        await deleteDoc(doc(db, "friends", id));
      });

      myFriendsList.appendChild(div);
    });
  });
}


// =======================
// 🔹 3. Saran Teman (user lain)
// =======================
async function loadSuggestions(email) {
  const usersSnap = await getDocs(collection(db, "users"));
  const allUsers = usersSnap.docs.map((d) => d.data().email).filter((e) => e !== email);

  if (allUsers.length === 0) {
    suggestList.innerHTML = `<p class='text-slate-400 text-sm'>Tidak ada saran teman 😄</p>`;
    return;
  }

  suggestList.innerHTML = "";
  allUsers.forEach((mail) => {
    const div = document.createElement("div");
    div.className = "card flex items-center justify-between";

    div.innerHTML = `
      <div class="flex items-center gap-3">
        <img src="https://ui-avatars.com/api/?name=${mail}" class="avatar" alt="avatar">
        <div>
          <h3 class="font-semibold">${mail}</h3>
          <p class="text-sm text-slate-400">Orang yang mungkin kamu kenal</p>
        </div>
      </div>
      <button class="btn btn-confirm text-sm">Tambah</button>
    `;

    div.querySelector(".btn-confirm").addEventListener("click", async () => {
      await addDoc(collection(db, "friendRequests"), {
        from: email,
        to: mail,
        status: "pending",
        createdAt: Date.now(),
      });
      div.querySelector(".btn-confirm").textContent = "Terkirim ✅";
      div.querySelector(".btn-confirm").disabled = true;
    });

    suggestList.appendChild(div);
  });
}
