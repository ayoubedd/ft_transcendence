export default [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      requiresAuth: true,
      sidebarHeader: defineAsyncComponent(() => import('@/components/games/GameNew.vue')),
      sidebarNav: defineAsyncComponent(() => import('@/components/home/FriendsInGame.vue')),
      navBar: defineAsyncComponent(() => import('@/components/home/HomeNavbar.vue'))
    }
  },
  {
    path: '/profile/:username?',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: {
      requiresAuth: true,
      sidebarHeader: defineAsyncComponent(
        () => import('@/components/profile/ProfileFriendsSearch.vue')
      ),
      sidebarNav: defineAsyncComponent(() => import('@/components/profile/ProfileFriendsList.vue')),
      navBar: defineAsyncComponent(() => import('@/components/profile/ProfileNavBar.vue'))
    }
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('@/views/ChatView.vue'),
    meta: {
      requiresAuth: true,
      sidebarHeader: defineAsyncComponent(() => import('@/components/chat/ChatSearch.vue')),
      sidebarNav: defineAsyncComponent(() => import('@/components/chat/Chats.vue')),
      navBar: defineAsyncComponent(() => import('@/components/chat/ChatNavBar.vue')),
      aside: defineAsyncComponent(() => import('@/components/chat/ChatAside.vue'))
    }
  },
  {
    path: '/friends',
    name: 'friends',
    component: () => import('@/views/FriendsView.vue'),
    meta: {
      requiresAuth: true,
      sidebarHeader: defineAsyncComponent(() => import('@/components/friends/FriendsSearch.vue')),
      sidebarNav: defineAsyncComponent(() => import('@/components/friends/FriendsList.vue')),
      navBar: defineAsyncComponent(() => import('@/components/friends/FriendsNavBar.vue'))
    }
  },
  {
    path: '/games',
    name: 'games',
    component: () => import('@/views/GamesView.vue'),
    meta: {
      requiresAuth: true,
      sidebarHeader: defineAsyncComponent(() => import('@/components/games/GameNew.vue')),
      sidebarNav: defineAsyncComponent(() => import('@/components/games/RecentlyMet.vue')),
      navBar: defineAsyncComponent(() => import('@/components/games/GamesNavBar.vue'))
    }
  },
  {
    path: '/pong/:mode?', // match query param
    name: 'pong',
    component: () => import('@/views/PongView.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/pong/over',
    name: 'pongOver',
    component: () => import('@/views/PongOverView.vue'),
    meta: {
      requiresAuth: true
    }
  }
]
