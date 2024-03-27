<script lang="ts" setup>
import type { Friend } from '@/types/friend.types'
import { XCircle } from 'lucide-vue-next'

const props = defineProps<{
  user: Friend
}>()

const toast = useToast()
const { rejectFriend } = useFriendStore()
const loading = ref(false)
const shouldApear = computed(() => {
  return useFriendStore().friendRequests.some((request) => request.id === props.user?.id)
})

async function reject() {
  if (!confirm('Are you sure you want to reject this friend request?')) return
  try {
    loading.value = true
    await rejectFriend(props.user, {
      friendshiId: props.user?.friendship?.id as string
    })
    loading.value = false
    toast.success('Friend request rejected')
  } catch (error: any) {
    toast.error(error?.message)
    loading.value = false
  }
}
</script>

<template>
  <div class="friend-reject" v-if="shouldApear">
    <slot :loading="loading" :reject="reject">
      <Button
        class="flex gap-2 items-center border-[1px] border-[#f968684e] text-red-400 px-2 py-1 text-sm"
        :loading="loading"
        @click="reject"
      >
        <XCircle class="w-[16px] h-[16px]" />
        <span>Reject</span>
      </Button>
    </slot>
  </div>
</template>
