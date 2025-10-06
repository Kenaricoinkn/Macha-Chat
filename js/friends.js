import { auth, db } from "./config.js";
import {
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const requestsEl = document.getElementById("friendsList");
const suggestionsEl = document.getElementById("suggestions");
const friendListEl = document.getElementById("friendList");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "./login.html";
  } else {
    loadFriendRequests(user.email);
    loadFriendList(user.uid);
    loadSuggestions(user.uid);
  }
});

// 🟦 1️⃣ Load Permintaan Pertemanan
function loadFriendRequests(email) {
  const q = query(collection(db, "friendRequests"), where("to", "==", email));
  onSnapshot(q, (snapshot) => {
    requestsEl.innerHTML = "";

    if (snapshot.empty) {
      requestsEl.innerHTML = `<p class='text-slate-400 text-sm text-center'>Tidak ada permintaan pertemanan 😄</p>`;
      return;
    }

    snapshot.forEach(async (docSnap) => {
      const data = docSnap.data();
      const fromUserRef = doc(db, "users", data.fromUID);
      const fromUser = (await getDoc(fromUserRef)).data();

      const card = document.createElement("div");
      card.className = "card flex items-center justify-between";

      card.innerHTML = `
        <div class="flex items-center gap-3">
          <img src="${fromUser?.photoURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(fromUser?.name || 'User')}" class="avatar" alt="avatar">
          <div>
            <h3 class="font-semibold">${fromUser?.name || data.from}</h3>
            <p class="text-sm text-slate-400">Ingin berteman denganmu</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-confirm flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            Terima
          </button>
          <button class="btn btn-delete flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Tolak
          </button>
        </div>
      `;

      const btnConfirm = card.querySelector(".btn-confirm");
      const btnDelete = card.querySelector(".btn-delete");

      btnConfirm.addEventListener("click", async () => {
        await updateDoc(doc(db, "friendRequests", docSnap.id), { status: "accepted" });

        const currentUser = auth.currentUser;
        if (currentUser) {
          await updateDoc(doc(db, "users", currentUser.uid), {
            [`friends.${data.fromUID}`]: true,
          });
          await updateDoc(doc(db, "users", data.fromUID), {
            [`friends.${currentUser.uid}`]: true,
          });
        }
      });

      btnDelete.addEventListener("click", async () => {
        await deleteDoc(doc(db, "friendRequests", docSnap.id));
      });

      requestsEl.appendChild(card);
    });
  });
}

// 🟪 2️⃣ Load Daftar Teman
function loadFriendList(uid) {
  const userRef = doc(db, "users", uid);
  onSnapshot(userRef, async (snap) => {
    friendListEl.innerHTML = "";
    const data = snap.data();

    if (!data?.friends || Object.keys(data.friends).length === 0) {
      friendListEl.innerHTML = `<p class='text-slate-400 text-sm text-center'>Belum ada teman 😅</p>`;
      return;
    }

    for (const friendUID of Object.keys(data.friends)) {
      const fSnap = await getDoc(doc(db, "users", friendUID));
      if (fSnap.exists()) {
        const f = fSnap.data();

        const card = document.createElement("div");
        card.className = "card flex items-center justify-between";

        card.innerHTML = `
          <div class="flex items-center gap-3">
            <img src="${f.photoURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(f.name || 'User')}" class="avatar" alt="avatar">
            <div>
              <h3 class="font-semibold">${f.name || "Tanpa Nama"}</h3>
              <p class="text-sm text-slate-400">${f.email}</p>
            </div>
          </div>
          <button class="btn btn-delete flex items-center gap-1 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Hapus
          </button>
        `;

        const btnDelete = card.querySelector(".btn-delete");
        btnDelete.addEventListener("click", async () => {
          await updateDoc(userRef, { [`friends.${friendUID}`]: false });
          await updateDoc(doc(db, "users", friendUID), { [`friends.${uid}`]: false });
        });

        friendListEl.appendChild(card);
      }
    }
  });
}

// 🟨 3️⃣ Saran Teman (pengguna lain)
async function loadSuggestions(uid) {
  const usersSnap = await getDocs(collection(db, "users"));
  let html = "";
  usersSnap.forEach((u) => {
    const data = u.data();
    if (u.id !== uid && !data.friends?.[uid]) {
      html += `
        <div class="card flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img src="${data.photoURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(data.name || 'User')}" class="avatar">
            <div>
              <h3 class="font-semibold">${data.name}</h3>
              <p class="text-sm text-slate-400">${data.email}</p>
            </div>
          </div>
          <button class="btn btn-confirm flex items-center gap-1 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Tambah
          </button>
        </div>`;
    }
  });

  suggestionsEl.innerHTML = html || `<p class='text-slate-400 text-sm text-center'>Tidak ada saran teman 😄</p>`;
}
