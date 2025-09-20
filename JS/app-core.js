import { setupRoutes, routeTo } from './router.js'
import { bindAuthForms, watchAuth } from './auth.js'
import { bindComposer, startFeeds } from './posts.js'

setupRoutes()
bindAuthForms()
bindComposer()

// Auth watcher membuka/tutup gate & render identitas; saat login siapin feed
watchAuth((user)=>{
  if(user){
    startFeeds()
    routeTo('home')
  }
})
