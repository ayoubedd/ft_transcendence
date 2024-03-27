<script lang="ts" setup>
import type { Friend } from '@/types/friend.types'
import { CheckCheck } from 'lucide-vue-next'

const props = defineProps<{
  user?: Friend
}>()

const toast = useToast()
const { acceptFriend } = useFriendStore()
const loading = ref(false)
const shouldApear = computed(() => {
  return useFriendStore().friendRequests.some((request) => request.id === props.user?.id)
})

async function accept() {
  try {
    loading.value = true
    await acceptFriend(
      {
        him: props.user?.id || ''
      },
      props.user
    )
    loading.value = false
    toast.success('Friend request accepted')
  } catch (error: any) {
    toast.error(error?.message)
    loading.value = false
  }
}
</script>

<template>
  <div class="friend-accept" v-if="shouldApear">
    <slot :loading="loading" :accept="accept">
      <Button
        class="accept-btn justify-center text-gray-400 bg-[#2b2d32] hover:text-gray-100 hover:bg-[#25272b]"
        :loading="loading"
        @click="accept"
      >
        <span class="visually-hidden">Accept</span>
        <CheckCheck class="w-[20px] h-[20px]" />
      </Button>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.accept-btn {
  border-radius: 50%;
  @apply w-[35px] h-[35px];
}
</style>
