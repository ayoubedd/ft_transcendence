<script lang="ts" setup>
import type { User } from '@/types/user.types'
import { Plus } from 'lucide-vue-next'

const props = defineProps<{ friend: User }>()

const toast = useToast()
const { inviteToChat } = useChatStore()
const { activeChat } = storeToRefs(useChatStore())
const loading = ref(false)
const added = ref(false)

async function addMember() {
  if (!activeChat.value) return
  loading.value = true
  try {
    await inviteToChat({
      channelId: activeChat.value?.chat.id,
      receiverId: props.friend.id
    })
    loading.value = false
    added.value = true
    toast.success('Invite sent successfully')
  } catch (error: any) {
    toast.error(error?.message)
    loading.value = false
  }
}
</script>

<template>
  <div class="member-add">
    <div class="member-add__avatar">
      <Avatar :user="friend" :status="false" :popover="false" />
    </div>
    <div class="member-add__info">
      <h4 class="member-add__info__name">{{ friend.username }}</h4>
    </div>
    <div class="member-add__actions">
      <Button class="btn btn-primary" :loading="loading" @click="addMember" :disabled="added">
        <template v-if="!added">
          <Plus class="w-[18px] h-[18px] stroke-gray-100" />
          <span>Add</span>
        </template>
        <template v-else>
          <span> Invite Sent</span>
        </template>
      </Button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.member-add {
  @apply flex items-center gap-4;
  @apply bg-background2;
  @apply border-b border-background;
  @apply px-1 pb-2;

  &__avatar {
    @apply w-[32px] h-[32px];
  }
  &__info {
    @apply flex-1;

    &__name {
      @apply text-gray-100 max-w-[150px] truncate;
      @apply font-medium;
    }
  }

  &__actions {
    @apply flex items-center gap-2;

    & > button {
      @apply flex items-center gap-1;
      @apply text-gray-100 bg-[#35383e];
      @apply px-2.5 py-0;
      @apply rounded-sm;
      @apply border border-transparent;
    }
  }
}
</style>
