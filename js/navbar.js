// ============ Navbar & Tabs Komponen (Reusable) ============

export function renderNavbar(active = "home") {
  return `
  <!-- 🔝 Navbar -->
  <div class="topbar flex justify-between items-center px-4 py-2 bg-[#0f142b]/90 backdrop-blur-md border-b border-slate-700/40 shadow-lg sticky top-0 z-50">
    <div class="logo text-2xl font-extrabold bg-gradient-to-r from-brand to-brand2 bg-clip-text text-transparent">MACHA</div>
    <div class="flex gap-3 items-center">
      <button class="icon-btn text-slate-300 hover:text-brand transition" onclick="window.location.href='./dashboard.html'">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
      </button>
      <button class="icon-btn text-slate-300 hover:text-brand transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"/></svg>
      </button>
      <button id="menuBtn" class="icon-btn text-slate-300 hover:text-brand transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
    </div>
  </div>

  <!-- 📑 Tabs -->
  <div class="tabs flex justify-around items-center py-2 bg-[#141a35]/70 backdrop-blur-md border-b border-slate-700/40 sticky top-[52px] z-40">
    ${renderTabItem("home", "dashboard.html", "M3 9.75 12 4l9 5.75V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.75z", active)}
    ${renderTabItem("friends", "friends.html", "M17 20h5v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2h5m6-16a4 4 0 1 1-8 0 4 4 0 0 1 8 0z", active)}
    ${renderTabItem("chat", "chat.html", "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM8 12h8M12 8v8", active)}
    ${renderTabItem("notif", "notif.html", "M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C8.67 6.165 7 8.388 7 11v3.159c0 .538-.214 1.055-.595 1.436L5 17h5", active)}
    ${renderTabItem("live", "live.html", "M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14m0-4v4m-9 4h9a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z", active)}
    ${renderTabItem("store", "store.html", "M3 7h18l-2 13H5L3 7zM16 3H8v4h8V3z", active)}
  </div>
  `;
}

function renderTabItem(name, link, path, active) {
  const isActive = name === active ? "text-brand" : "text-slate-400 hover:text-brand";
  return `
    <a href="./${link}" class="tab-btn flex flex-col items-center ${isActive}">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="${path}"/>
      </svg>
    </a>
  `;
}
