<script lang="ts" setup>
import type { User } from '@/types/user.types'
import { Ban, Unlock } from 'lucide-vue-next'
import { MoreVertical } from 'lucide-vue-next'

const props = defineProps<{
  user?: User
  size?: 'lg'
}>()

const { user: loggedInUser } = storeToRefs(useAuthStore())

const shouldApear = computed(() => {
  return props.user?.id !== loggedInUser.value.id
})

const moreActions = ref<HTMLDivElement | null>(null)
const otherActions = ref(false)

function closeOnOutsideClick(event: MouseEvent) {
  if (moreActions.value && !moreActions.value.contains(event.target as Node)) {
    otherActions.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeOnOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', closeOnOutsideClick)
})
</script>

<template>
  <div class="more-actions" v-if="shouldApear" ref="moreActions">
    <Button class="trigger" :class="[size]" @click="otherActions = !otherActions">
      <MoreVertical class="stroke-gray-200" />
    </Button>

    <div class="more-actions__content" v-show="otherActions">
      <FriendBlockUnblock :user="user">
        <template #block="{ block, loading }">
          <Button
            class="flex items-center gap-2 px-4 py-2 rounded-sm w-full text-base font-medium text-red-400"
            @click="block"
            :loading="loading"
          >
            <Ban class="w-[16px] h-[16px]" />
            <span>Block</span>
          </Button>
        </template>
        <template #unblock="{ loading, unblock }">
          <Button
            class="flex items-center gap-2 px-4 py-2 rounded-sm w-full text-base font-medium text-red-400"
            @click="unblock"
            :loading="loading"
          >
            <Unlock class="w-[16px] h-[16px]" />
            <span>Unblock</span>
          </Button>
        </template>
      </FriendBlockUnblock>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.more-actions {
  @apply relative;
  .trigger {
    @apply flex items-center justify-center;
    @apply bg-slate-600 ml-2 px-1 py-1 rounded-sm;

    &.lg {
      @apply py-2;
    }

    &.lg ~ .more-actions__content {
      @apply top-[44px];
    }
  }

  &__content {
    @apply absolute top-[38px] w-32 right-0 bg-background2 border border-gray-600 rounded-sm py-1;
    @apply flex flex-col gap-2;
    @apply shadow-md;
  }
}
</style>
