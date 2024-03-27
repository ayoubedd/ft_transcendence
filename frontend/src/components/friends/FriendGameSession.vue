<script lang="ts" setup>
import type { User } from '@/types/user.types'
import { Swords } from 'lucide-vue-next'

defineOptions({
  inheritAttrs: false
})
const props = defineProps<{
  user?: User
  size?: 'lg'
}>()

const toast = useToast()
const { user: loggedInUser } = storeToRefs(useAuthStore())
const { sendGameInvite } = useGameStore()

const shouldApear = computed(() => {
  return props.user?.id !== loggedInUser.value.id && props.user?.friendship?.status === 'ACCEPTED'
})

async function _sendGameInvite() {
  try {
    await sendGameInvite({ inviteeId: props.user?.id as string })
    toast.success('Game invite sent', { timeout: 2000 })
  } catch (error: any) {
    toast.error(error?.message)
  }
}
</script>

<template>
  <div class="game-invite" v-if="shouldApear">
    <slot name="add">
      <Button
        :class="[size]"
        class="game-invite__btn bg-orange-500 text-gray-100"
        @click="_sendGameInvite"
      >
        <Swords />
      </Button>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.game-invite {
  display: flex;

  &__btn {
    @apply flex gap-3 px-2 py-1 h-8 rounded-sm text-base font-medium;

    &.lg {
      @apply px-4 py-2 h-10;

      & > svg {
        @apply h-6 w-6;
      }
    }
  }
}
</style>
