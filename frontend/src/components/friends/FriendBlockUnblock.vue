<script lang="ts" setup>
import type { User } from '@/types/user.types'
import { Unlock, Ban } from 'lucide-vue-next'

const props = defineProps<{
  user?: User
  variant?: 'icon'
}>()

const toast = useToast()
const { user: loggedInUser } = storeToRefs(useAuthStore())
const { blockFriend, unblockFriend } = useFriendStore()
const loading = ref(false)
const blocked = ref(false)

const shouldApear = computed(() => {
  return props.user?.id !== loggedInUser.value.id
})

async function _block() {
  if (!window.confirm(`Are you sure you want to block ${props.user?.username}?`)) return

  try {
    loading.value = true
    await blockFriend({
      him: props.user?.id || ''
    })
    toast.success('User blocked successfully')
    loading.value = false
    blocked.value = true
  } catch (error: any) {
    toast.error(error?.message)
    loading.value = false
  }
}

async function _unblock() {
  if (!window.confirm(`Are you sure you want to unblock ${props.user?.username}?`)) return
  try {
    loading.value = true
    await unblockFriend({
      him: props.user?.id || ''
    })
    toast.success('User unblocked successfully')
    loading.value = false
    blocked.value = false
  } catch (error: any) {
    toast.error(error?.message)
    loading.value = false
  }
}
</script>

<template>
  <div class="block-unblock" v-if="shouldApear">
    <slot
      name="unblock"
      v-if="user?.friendship?.status == 'BLOCKED' || blocked"
      :unblock="_unblock"
      :loading="loading"
    >
      <Button
        class="flex gap-2 items-center border-[1px] border-[#f968684e] text-red-400 px-2 py-1 text-sm"
        :class="[variant]"
        @click="_unblock"
        :loading="loading"
      >
        <Unlock v-if="variant === 'icon'" />
        <template v-else>
          <Unlock class="w-[16px] h-[16px]" />
          <span>Unblock</span>
        </template>
      </Button>
    </slot>

    <slot
      name="block"
      v-if="user?.friendship?.status != 'BLOCKED' && !blocked"
      :block="_block"
      :loading="loading"
    >
      <Button
        class="flex gap-2 items-center border-[1px] border-[#f968684e] text-red-400 px-2 py-1 text-sm"
        :class="[variant]"
        @click="_block"
        :loading="loading"
      >
        <Ban v-if="variant === 'icon'" />
        <template v-else>
          <Ban class="w-[16px] h-[16px]" />
          <span>Block</span>
        </template>
      </Button>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.block-unblock {
  @apply flex flex-col;

  &__btn {
    @apply flex items-center justify-center gap-2 px-2 py-2 rounded-sm w-full text-base font-medium;
    transition: opacity 0.25s ease-in-out;

    &:hover {
      opacity: 0.8;
    }

    &.icon {
      @apply px-2 py-1 h-8;
    }
  }
}
</style>
