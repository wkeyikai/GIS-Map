import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
// import { VueReCaptcha } from 'vue-recaptcha-v3'
import vant from 'vant'
// import '@vant/touch-emulator'
import { Lazyload } from 'vant'
// import 'virtual:svg-icons-register'

// import * as ElIcons from '@element-plus/icons-vue'

import 'vant/lib/index.css' // 全局vant樣式

import gisPlugin from './plugins/gis'

// import './style/main.scss'
// 動態載入指定主題scss

const app = createApp(App)
const pinia = createPinia()

app.config.globalProperties.$device = 'PC'

// Object.keys(ElIcons).forEach((key) => {
//   app.component(key, ElIcons[key as keyof typeof ElIcons])
// })

// 按需引用 element-plus
// elComponents.forEach((component: any) => {
//   app.component(component.name, component)
// })
// elPlugins.forEach((plugin) => {
//   app.use(plugin)
// })

app.use(gisPlugin)

;(async () => {
  // 跳轉處理
  // await useDeviceRedirect()
  // 從後端 API 獲取主題名稱
  // const themeName = await fetchThemeName();
  // 根據後端返回的主題名稱動態切換主題
  // await loadTheme('black')
  // await getMessage()
  app
    // .use(vant)
    // .use(Lazyload, { lazyComponent: true })
    // .use(pinia)
    // .use(customDirectives)
    // .use(i18n)
    // .use(VueReCaptcha, { siteKey })
    .use(router)
    .mount('#app')
})()
