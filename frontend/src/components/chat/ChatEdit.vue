<script setup lang="ts">
import type { ChatCreatePayload } from '@/types/chat.types'

const toast = useToast()
const { updateChat } = useChatStore()
const { activeChat } = storeToRefs(useChatStore())

const formData = ref<ChatCreatePayload>({
  name: activeChat.value?.chat.name || '',
  type: activeChat.value?.chat.type || 'PUBLIC',
  password: ''
})
const loading = ref(false)
const openDropdown = ref(false)

async function editChat() {
  if (!formData.value.name || !activeChat.value) return

  loading.value = true
  try {
    await updateChat(activeChat.value?.chat.id, formData.value)
    loading.value = false
    openDropdown.value = false
    toast.success('Chat updated successfully')
  } catch (error: any) {
    toast.error(error?.message)
    loading.value = false
  }
}

watch(activeChat, () => {
  formData.value = {
    name: activeChat.value?.chat.name || '',
    type: activeChat.value?.chat.type || 'PUBLIC',
    password: ''
  }
})
</script>

<template>
  <DropdownMenu v-model:open="openDropdown">
    <DropdownMenuTrigger as-child @click="openDropdown = !openDropdown">
      <slot />
    </DropdownMenuTrigger>
    <DropdownMenuContent side="bottom" align="end" class="bg-background2 border-none">
      <div class="chat-edit">
        <div class="chat-edit__header">
          <h3 class="chat-edit__header__title">Edit this chat</h3>
        </div>
        <form class="chat-edit__body" @submit.prevent="editChat">
          <input
            v-model="formData.name"
            type="text"
            placeholder="Chat name"
            class="input-primary"
          />
          <select class="input" v-model="formData.type">
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
            <option value="PROTECTED">Protected</option>
          </select>
          <input
            v-if="formData.type === 'PROTECTED' || formData.type === 'PRIVATE'"
            v-model="formData.password"
            type="password"
            placeholder="Enter new password"
            class="input-primary"
          />

          <Button type="submit" class="btn btn-primary mt-4">Edit</Button>
        </form>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<style lang="scss" scoped>
.chat-edit {
  @apply w-[400px];
  @apply bg-background2;

  &__header {
    @apply flex items-center justify-between;
    @apply px-4 py-2;
    @apply bg-background2;
    @apply border-b border-background2;
    @apply rounded-t-lg;

    &__title {
      @apply text-gray-100;
      @apply text-lg;
      @apply font-medium;
    }

    &__close {
      @apply text-gray-100;
      @apply text-lg;
      @apply font-medium;
      @apply hover:text-gray-200;
      @apply transition-colors duration-300;
    }
  }

  &__body {
    @apply px-4 pt-8 pb-5;
    @apply bg-background2;
    @apply border-b border-background2;
    @apply rounded-b-lg;
    @apply flex flex-col gap-2.5;

    & > select {
      @apply w-full;
      @apply bg-[#383a3f];
      @apply text-gray-200;
      @apply px-2.5 py-1.5;
      @apply rounded-sm;
      @apply border border-transparent;
      @apply focus:outline-none;
      @apply focus:ring-2 focus:ring-blue-500;

      &:focus {
        @apply border-primary;
      }
    }
  }
}
</style>
