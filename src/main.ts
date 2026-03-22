import { ViteSSG } from 'vite-ssg'
import { router } from './router'
import App from './App.vue'
import './style.css'

export const createApp = ViteSSG(
  App,
  { routes: router.options.routes },
  ({ app }) => {
    // 可以在这里安装插件
  }
)
