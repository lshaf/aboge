import { registerSW } from 'virtual:pwa-register'

// Self-hosted fonts (bundled + precached so they work offline / when installed)
import '@fontsource-variable/fraunces'
import '@fontsource-variable/plus-jakarta-sans'

import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

// PWA auto-update: register immediately, then keep checking so long-open tabs and
// installed apps pick up new deploys without a manual hard-refresh. In autoUpdate
// mode a found update activates and reloads on its own.
const UPDATE_INTERVAL_MS = 30 * 60 * 1000 // every 30 minutes
registerSW({
  immediate: true,
  onRegisteredSW(swUrl, reg) {
    if (!reg) return
    const check = () => { if (navigator.onLine) reg.update() }
    setInterval(check, UPDATE_INTERVAL_MS)
    // also check when the tab regains focus or the network comes back
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') check()
    })
    window.addEventListener('online', check)
  },
})

createApp(App).mount('#app')
