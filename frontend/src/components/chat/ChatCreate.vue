<script setup lang="ts">
import type { ChatCreatePayload } from '@/types/chat.types'

const toast = useToast()

const formData = ref<ChatCreatePayload>({
  name: '',
  type: 'PUBLIC',
  password: ''
})
const loading = ref(false)
const openPopup = ref(false)

const { createChat } = useChatStore()

function resetForm() {
  formData.value.name = ''
  formData.value.type = 'PUBLIC'
  formData.value.password = ''
}

async function _createChat() {
  if (!formData.value.name) return

  if (
    (formData.value.type === 'PROTECTED' || formData.value.type === 'PRIVATE') &&
    !formData.value.password
  ) {
    toast.error('Password is required')
    return
  }
  loading.value = true
  try {
    await createChat(formData.value)
    resetForm()

    loading.value = false
    openPopup.value = false
    toast.success('Chat created successfully')
  } catch (error: any) {
    toast.error(error?.message)
    loading.value = false
  }
}
</script>

<template>
  <DropdownMenu v-model:open="openPopup">
    <DropdownMenuTrigger as-child @click="openPopup = true">
      <slot />
    </DropdownMenuTrigger>
    <DropdownMenuContent side="bottom" align="start" class="bg-background2 border-none">
      <div class="chat-create">
        <div class="chat-create__header">
          <h3 class="chat-create__header__title">Create a new chat</h3>
        </div>
        <form class="chat-create__body" @submit.prevent="_createChat">
          <input
            v-model.trim="formData.name"
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
            placeholder="Password"
            class="input-primary"
          />

          <Button type="submit" class="btn btn-primary mt-4" :loading="loading">Create</Button>
        </form>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<style lang="scss" scoped>
.chat-create {
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
