import { setupRoutes, routeTo } from './router.js'
import { bindAuthForms, watchAuth } from './auth.js'
import { bindComposer, startFeeds } from './posts.js'

setupRoutes()
bindAuthForms()
bindComposer()

// Watch auth: kalau login tampilkan feed
watchAuth((user)=>{
  if(user){
    startFeeds()
    routeTo('home')
  }
})
