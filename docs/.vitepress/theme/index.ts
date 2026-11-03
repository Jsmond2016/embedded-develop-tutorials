import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import ImageViewer from './ImageViewer.vue'
import SidebarAutoScroll from './SidebarAutoScroll.vue'
import 'viewerjs/dist/viewer.css'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'sidebar-nav-after': () => h(SidebarAutoScroll),
      'layout-bottom': () => h(ImageViewer)
    })
  }
}
