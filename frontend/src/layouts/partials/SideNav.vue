<script lang="ts" setup>
import { Home, UserCircle, MessageCircle, Users, Gamepad, LogOut } from 'lucide-vue-next'

const { logout } = useAuthStore()

const links = [
  { name: 'Home', icon: Home, to: 'home', hasNewUpdates: true },
  { name: 'Profile', icon: UserCircle, to: 'profile', hasNewUpdates: true },
  { name: 'Chat', icon: MessageCircle, to: 'chat', hasNewUpdates: true },
  { name: 'Friends', icon: Users, to: 'friends', hasNewUpdates: true },
  { name: 'Games', icon: Gamepad, to: 'games', hasNewUpdates: true }
]
const showTooltip = ref(false)
const activeLink = ref(0)

const pos = computed(() => {
  const el = document.getElementById(`sidenav__item__link-${activeLink.value}`)

  if (el) {
    const { top, height } = el.getBoundingClientRect()
    return { top: `${top + height / 2}px` }
  }
  return { top: '36px' }
})

function setActiveLink(index: number) {
  activeLink.value = index
  showTooltip.value = true
}
</script>

<template>
  <nav class="sidenav">
    <ul class="sidenav__list">
      <template v-for="(link, i) in links" :key="i">
        <li class="sidenav__item">
          <router-link
            :to="{ name: link.to }"
            class="sidenav__item__link"
            :id="`sidenav__item__link-${i}`"
            @mouseenter="setActiveLink(i)"
            @mouseleave="showTooltip = false"
            @click="showTooltip = false"
          >
            <component :is="link.icon" class="sidenav__item__icon" />
          </router-link>
          <span class="sidenav__item__little-dot" :class="{ hide: !link.hasNewUpdates }"></span>
          <span class="visually-hidden">{{ link.name }}</span>
        </li>
        <li class="sidenav__item__divider" v-if="i == 0"></li>
      </template>
      <span class="sidenav__item__text" :style="pos" :class="{ show: showTooltip }">
        <component :is="links[activeLink].icon" width="16" />
        <span>{{ links[activeLink].name }}</span>
      </span>
    </ul>

    <Button class="sidenav__logout-btn" @click="logout">
      <span class="visually-hidden">Logout</span>
      <LogOut />
    </Button>
  </nav>
</template>

<style lang="scss" scoped>
.sidenav {
  @apply bg-background2 text-gray-400 text-lg font-medium grid w-[240px] py-3;
  grid-template-rows: auto 1fr auto;

  &__list {
    @apply grid gap-2 h-full;
  }

  &__item {
    @apply flex items-center justify-center relative;

    &__divider {
      @apply w-8 h-[2px] mx-auto bg-[#37383D] rounded-xl;
    }

    &__little-dot {
      @apply w-2 h-2 rounded-full bg-white absolute left-[-4px] top-1/2 transform -translate-y-1/2;
      @apply transition-all duration-200 ease-in-out;

      &.hide {
        @apply w-0 h-0;
      }
    }

    &__link {
      @apply flex items-center justify-center gap-2 w-[48px] h-[48px] rounded-3xl bg-[#313338] relative;
      @apply transition-all duration-200 ease-in-out;

      &:hover {
        @apply rounded-2xl;
        & ~ .sidenav__item__little-dot {
          @apply h-5 w-2;
        }
      }

      &.router-link-exact-active {
        @apply rounded-2xl;
      }

      &.router-link-exact-active ~ .sidenav__item__little-dot {
        @apply w-2 h-9;
      }
    }

    &__icon {
      @apply w-6 h-6;
      stroke: hsl(var(--primary) / 0.8);
    }

    &__text {
      @apply absolute left-[74px] top-1/2 transform -translate-y-1/2 px-3 py-1 rounded-md bg-[#47484f] text-xs text-white;
      @apply flex gap-2 items-center opacity-0 z-40 pointer-events-none;
      transition:
        opacity 0.25s ease-in-out,
        left 0.25s ease-in-out,
        top 0.25s ease-in-out;

      &.show {
        opacity: 1;
        left: 70px;
      }

      &::before {
        content: '';
        position: absolute;
        left: -6px;
        top: 50%;
        transform: translateY(-50%) rotate(180deg);
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 6px 0 6px 6px;
        border-color: transparent transparent transparent #47484f;
      }
    }
  }

  &__logout-btn {
    @apply mt-auto mx-auto bg-transparent text-gray-400 hover:text-white;
  }
}
</style>
