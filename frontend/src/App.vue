<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import PongLayout from '@/layouts/PongLayout.vue'

const route = useRoute()
const router = useRouter()

const routerReady = ref(false)

function getLayout(path: string) {
  if (path.startsWith('/auth')) return AuthLayout
  if (path.startsWith('/pong')) return PongLayout

  return MainLayout
}

router.isReady().then(() => {
  routerReady.value = true
})
</script>

<template>
  <Transition name="layout-transition" class="app__container" mode="out-in">
    <Component :is="getLayout(route.path)" v-if="routerReady">
      <template #sidebarHeader>
        <Transition name="view-slide-fade" mode="out-in">
          <component :is="route.meta.sidebarHeader" />
        </Transition>
      </template>

      <template #sidebarNav>
        <Transition name="view-slide-fade" mode="out-in">
          <component :is="route.meta.sidebarNav" />
        </Transition>
      </template>

      <template #mainNavigation>
        <Transition name="view-slide-fade" mode="out-in">
          <component :is="route.meta.navBar" />
        </Transition>
      </template>

      <template #aside>
        <Transition name="view-slide-fade" mode="out-in">
          <component :is="route.meta.aside" v-if="route.meta.aside" />
          <LiveUpdates v-else />
        </Transition>
      </template>

      <RouterView v-slot="{ Component }">
        <Transition name="view-slide-fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </Component>
  </Transition>

  <GlobalSockets />
</template>

<style lang="scss">
.app__container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.view-slide-fade-enter-active,
.view-slide-fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.view-slide-fade-enter-from,
.view-slide-fade-leave-to {
  transform: translateY(-5px);
  opacity: 0;
}

.layout-transition-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

.layout-transition-enter-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

.layout-transition-leave-to {
  transform: scale(1.1);
  opacity: 0;
}

.layout-transition-enter-from {
  transform: scale(0.95);
  opacity: 0;
}

::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #4e515b;
  border-radius: 4px;
}
</style>
