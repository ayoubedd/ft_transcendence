<script lang="ts" setup>
import { SendHorizonal } from 'lucide-vue-next'

const toast = useToast()
const { sendMessage } = useChatStore()
const { activeChat } = storeToRefs(useChatStore())

const message = ref('')

async function _sendMessage() {
  if (!message.value) return
  try {
    await sendMessage(message.value)
    message.value = ''
    await scrollToBottom()
  } catch (error: any) {
    toast.error(error?.message)
    console.error(error)
  }
}

async function scrollToBottom() {
  await nextTick()
  const messagesList = document.querySelector('.messages-list')
  messagesList?.scrollTo(0, messagesList.scrollHeight)
}

watch(activeChat, () => {
  message.value = ''
})
</script>

<template>
  <div class="new-message">
    <form @submit.prevent="_sendMessage">
      <input type="text" placeholder="Type a message..." v-model.trim="message" />
      <Button type="submit"><SendHorizonal /></Button>
    </form>
  </div>
</template>

<style lang="scss" scoped>
.new-message {
  @apply flex items-center px-4 py-1 h-[40px] relative;
  box-shadow: 0 0 10px #0000001a;

  & form {
    @apply w-full h-full flex items-center gap-2;
  }

  & form > input {
    @apply w-full bg-[#383A40] text-gray-200 text-base font-normal rounded-sm px-3 pr-14 py-2;
    @apply focus:outline-none;
  }

  & form > button {
    @apply absolute right-6 top-1/2 transform -translate-y-1/2;
    @apply w-[32px] h-[32px] flex items-center justify-center;
    @apply rounded-full text-gray-100 hover:bg-primary;

    & svg {
      @apply w-[22px];
    }
  }
}
</style>
