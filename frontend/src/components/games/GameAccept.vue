<script lang="ts" setup>
const toast = useToast()
const { acceptGameInvite, rejectGameInvite } = useGameStore()
import type { User } from '@/types/user.types'
import { Swords, XCircle } from 'lucide-vue-next'

const props = defineProps<{
  invite: { id: string; host: User }
}>()
const emit = defineEmits<{
  'close-toast': []
}>()

const loading = ref(false)

async function _acceptGameInvite() {
  loading.value = true
  try {
    await acceptGameInvite({
      id: props.invite.id as string
    })
    emit('close-toast')
  } catch (error: any) {
    toast.error(error?.message)
  }
  loading.value = false
}

async function _rejectGameInvite() {
  try {
    await rejectGameInvite({
      id: props.invite.id as string
    })
    emit('close-toast')
  } catch (error: any) {
    toast.error(error?.message)
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <h3 class="text-lg flex gap-1.5 items-center">
      <Avatar :user="invite?.host" :status="false" />
      <span class="text-primary font-bold text-xl max-w-[150px] truncate">
        {{ invite?.host?.username }}
      </span>
      <span>invited you to play</span>
    </h3>

    <div class="flex gap-4">
      <Button
        class="bg-primary px-6 py-1 text-gray-100 gap-4"
        @click="_acceptGameInvite"
        :loading="loading"
      >
        <Swords class="h-4 w-4" />
        <span class="text-base font-medium">Let's play</span>
      </Button>
      <Button
        class="text-gray-300 px-4 py-1 gap-2 border-[1px] border-gray-600"
        @click="_rejectGameInvite"
      >
        <XCircle class="h-4 w-4" />
        <span class="text-base font-medium">No thanks</span>
      </Button>
    </div>
  </div>
</template>
