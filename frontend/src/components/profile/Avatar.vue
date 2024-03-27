<script lang="ts" setup>
import type { User } from '@/types/user.types'
import { Gamepad } from 'lucide-vue-next'
defineOptions({
  inheritAttrs: false
})
const props = withDefaults(
  defineProps<{
    user?: User
    avatar?: string
    fallback?: string
    popover?: boolean
    align?: 'start' | 'center' | 'end'
    status?: boolean
    size?: 'md' | 'lg' | 'xl'
  }>(),
  {
    popover: true,
    status: true
  }
)

const isFriend = computed(
  () => props.user?.friendship?.status == 'ACCEPTED' || props.user?.id == useAuthStore().user?.id
)
const _status = computed(() => props.user?.status)
const _user = computed(() => {
  if (props.user?.id == useAuthStore().user?.id) return useAuthStore().user
  return props.user
})
const _avatar = computed(() => {
  if (props.avatar) return props.avatar
  if (props.user?.id == useAuthStore().user?.id) return useAuthStore().user?.avatar
  return props.avatar ?? props.user?.avatar ?? ''
})
const _fallback =
  props.fallback ?? `https://ui-avatars.com/api/?name=${props.user?.username ?? 'user'}`

function setFallbackAvatar(e: Event) {
  const target = e.target as HTMLImageElement
  target.src = _fallback
}

async function listenForStatus() {
  const { trackedUsersStatus } = useFriendStore()
  const isOwner = props.user?.id == useAuthStore().user?.id
  if (trackedUsersStatus.includes(props.user?.id ?? '') || isOwner) return

  trackedUsersStatus.push(props.user?.id ?? '')
  const socket = useSocketsStore().getSocket('users')
  socket?.socket.on('status', (payload) => {
    if (payload.data.id == props.user?.id) {
      // eslint-disable-next-line vue/no-mutating-props
      if (props.user) props.user.status = payload.data.status

      useLiveUpdatesStore().addLiveUpdate({
        user: payload?.data,
        message: `is now ${payload.data?.status?.toLowerCase()}`,
        type: payload.data?.status?.toLowerCase(),
        date: new Date().toLocaleTimeString()
      })
    }
  })
}

onMounted(() => {
  listenForStatus()
})
</script>

<template>
  <ProfileHoverCard v-if="popover" :user="_user" :align="align">
    <div class="avatar" :class="size" v-bind="$attrs">
      <img :src="_avatar" alt="Avatar" class="avatar__img" @error="setFallbackAvatar" />
      <div v-show="status && isFriend" class="avatar__status" :class="_status">
        <Gamepad v-if="_status == 'INGAME'" class="avatar__status__inner" />
      </div>
    </div>
  </ProfileHoverCard>

  <div class="avatar" :class="size" v-bind="$attrs" v-else>
    <img :src="_avatar" alt="Avatar" class="avatar__img" @error="setFallbackAvatar" />
    <div v-show="status && isFriend" class="avatar__status" :class="_status">
      <Gamepad v-if="_status == 'INGAME'" class="avatar__status__inner" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.avatar {
  @apply relative w-[34px] h-[34px] rounded-full aspect-square cursor-pointer;

  &.md {
    @apply w-[37px] h-[37px];
  }

  &.md &__status {
    @apply w-[14px] h-[14px] bottom-[-3px] right-[-1px];

    &:after {
      @apply w-[5px] h-[5px];
    }
  }

  &.lg {
    @apply w-[50px] h-[50px];
  }

  &.lg &__status {
    @apply w-[16px] h-[16px] bottom-[-5px] right-0;

    &:after {
      @apply w-[6px] h-[6px];
    }
  }

  &.xl {
    @apply w-[100px] h-[100px];
  }

  &.xl &__status {
    @apply w-[22px] h-[22px] bottom-[0px] right-[6px];

    &:after {
      @apply w-[9px] h-[9px];
    }
  }

  &__img {
    @apply w-full h-full object-cover rounded-full;
  }

  &__status {
    @apply absolute bottom-[-5px] right-[-1px] w-[14px] h-[14px] rounded-full bg-[#80848E];
    @apply border-2 border-background;

    &__inner {
      @apply absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background;
      @apply w-[160%] h-[140%] z-10 stroke-primary rounded-sm;
    }

    &:after {
      content: '';
      @apply absolute w-[5px] h-[5px] rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background;
    }

    &.ONLINE {
      @apply bg-green-500;

      &:after {
        @apply bg-green-500;
      }
    }
  }
}
</style>
