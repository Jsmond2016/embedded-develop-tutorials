<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute } from 'vitepress'
import type Viewer from 'viewerjs'

const route = useRoute()
let viewer: Viewer | null = null
let initToken = 0
let timer: number | undefined

function destroyViewer() {
  viewer?.destroy()
  viewer = null
}

async function initViewer() {
  const token = ++initToken
  destroyViewer()

  const container = document.querySelector<HTMLElement>('.vp-doc')
  if (!container?.querySelector('img')) return

  const { default: ViewerClass } = await import('viewerjs')
  if (token !== initToken) return

  viewer = new ViewerClass(container, {
    navbar: false,
    title: (image) => image.alt,
    filter: (image) => !image.closest('a'),
    toolbar: {
      zoomIn: true,
      zoomOut: true,
      oneToOne: true,
      reset: true,
      rotateLeft: true,
      rotateRight: true,
      flipHorizontal: true,
      flipVertical: true,
      prev: true,
      next: true
    },
    zIndex: 9999
  })
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !viewer) return
  if (!document.querySelector('.viewer-container.viewer-in')) return

  event.stopPropagation()
  const instance = viewer
  window.setTimeout(() => instance.hide(), 0)
}

function scheduleInit() {
  window.clearTimeout(timer)
  timer = window.setTimeout(() => {
    requestAnimationFrame(() => {
      void initViewer()
    })
  }, 80)
}

watch(() => route.path, async () => {
  await nextTick()
  scheduleInit()
})

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  scheduleInit()
})

onBeforeUnmount(() => {
  window.clearTimeout(timer)
  document.removeEventListener('keydown', onKeydown)
  destroyViewer()
})
</script>

<template>
  <span class="image-viewer-anchor" aria-hidden="true" />
</template>
