import { createRouter, createWebHistory } from 'vue-router'
import mainRoutes from './main.routes'
import authRoutes from './auth.routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...authRoutes,
    ...mainRoutes,
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: {
        requiresAuth: true
      }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const { user, isLoggedIn, isTwoFaInProgress } = storeToRefs(useAuthStore())
  if (!user.value?.username && isLoggedIn.value && !isTwoFaInProgress.value)
    await useAuthStore().getMe()

  if (to.meta.requiresAuth && !isLoggedIn.value) {
    if (import.meta.env.DEV && import.meta.env.VITE_USE_AUTH == 'false') return next()
    return next({ name: 'login' })
  }

  next()
})

export default router
