import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import SidebarAutoScroll from './SidebarAutoScroll.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'sidebar-nav-after': () => h(SidebarAutoScroll)
    })
  }
}
