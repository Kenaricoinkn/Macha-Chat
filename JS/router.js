export const $  = (s)=> document.querySelector(s)
export const $$ = (s)=> Array.from(document.querySelectorAll(s))
export const show = (el)=> el.classList.remove('hidden')
export const hide = (el)=> el.classList.add('hidden')
export const toast = (msg)=>{
  const t = $('#toast')
  t.innerHTML = `<div class="px-4 py-2 rounded-xl bg-white text-slate-900 shadow">${msg}</div>`
  show(t); setTimeout(()=>hide(t), 2200)
}

export function setupRoutes(){
  $$('#nav button').forEach(btn=> btn.addEventListener('click', ()=> routeTo(btn.dataset.route)))
}

export function routeTo(name){
  $$('#nav button').forEach(b=> b.setAttribute('aria-selected', String(b.dataset.route===name)))
  const map = { home:'#feed', reels:'#reels', profile:'#profile', accounts:'#accounts' }
  Object.values(map).forEach(sel=> hide($(sel)))
  show($(map[name] || '#feed'))
}
