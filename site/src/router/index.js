import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Band from '../views/Band.vue'
import Chords from '../views/Chords.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/smplstcscntsts', name: 'band', component: Band },
  { path: '/chords', name: 'chords', component: Chords },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
