import { createRouter, createWebHistory } from 'vue-router'

import Landing from '../Landing.vue'
import Main from '../Main.vue'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: Landing
  },
  {
    path: '/main',
    name: 'Main',
    component: () => import('../Main.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router