import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

const routes = [
  {
    path: '/live/:liveId',
    component: App,
    name: 'live'
  },
  {
    path: '/live/:liveId/playback/:playbackId',
    component: App,
    name: 'playback'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router