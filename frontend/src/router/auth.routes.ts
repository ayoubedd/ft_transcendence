export default [
  {
    path: '/auth/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/auth/authorize',
    name: 'authorize',
    component: () => import('@/views/AuthorizeView.vue'),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/auth/2fa',
    name: '2fa',
    component: () => import('@/views/TwoFactorAuthView.vue'),
    meta: {
      requiresAuth: true
    }
  }
]
