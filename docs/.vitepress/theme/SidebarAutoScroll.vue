<script setup lang="ts">
import { nextTick, onMounted, watch } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
let frame = 0

function scrollToActiveItem() {
  const sidebar = document.querySelector<HTMLElement>('.VPSidebar')
  const active = sidebar?.querySelector<HTMLElement>('.VPSidebarItem.is-active > .item')
  if (!sidebar || !active) return

  const sidebarRect = sidebar.getBoundingClientRect()
  const activeRect = active.getBoundingClientRect()
  const target = Math.max(
    0,
    sidebar.scrollTop +
      activeRect.top -
      sidebarRect.top -
      sidebar.clientHeight / 2 +
      activeRect.height / 2
  )

  if (Math.abs(target - sidebar.scrollTop) < 4) return

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  sidebar.scrollTo({ top: target, behavior: reduceMotion ? 'auto' : 'smooth' })
}

function scheduleScroll() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    frame = requestAnimationFrame(scrollToActiveItem)
  })
}

watch(() => route.path, async () => {
  await nextTick()
  scheduleScroll()
})

onMounted(scheduleScroll)
</script>

<template>
  <span class="sidebar-autoscroll" aria-hidden="true" />
</template>
