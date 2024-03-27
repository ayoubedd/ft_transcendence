<script lang="ts" setup>
import type { ChatItem } from '@/types/chat.types'
import type { User } from '@/types/user.types'
import { getChannelDm } from '@/services/api/channels'
import { MessageCircle } from 'lucide-vue-next'

defineOptions({
  inheritAttrs: false
})
const props = defineProps<{
  user?: User
  size?: 'lg'
}>()

const router = useRouter()
const { user: loggedInUser } = storeToRefs(useAuthStore())
const { addNewDM, setActiveChat } = useChatStore()
const loading = ref(false)

const shouldApear = computed(() => {
  return props.user?.id !== loggedInUser.value.id
})

async function createChannel() {
  try {
    loading.value = true

    let newChat
    const { data, error } = await getChannelDm(props.user?.id || '')
    if (error) newChat = generateNewChat()
    else {
      newChat = {
        chat: data,
        members: [],
        membersBanned: [],
        messages: [],
        hasNewUpdates: false
      }
    }

    addNewDM(newChat)
    await setActiveChat(newChat)
    router.push({ name: 'chat' })
    loading.value = false
  } catch (error) {
    console.error(error)
    loading.value = false
  }
}

function generateNewChat() {
  const newChat: ChatItem = {
    chat: {
      id: `${loggedInUser.value.id}`,
      type: 'PRIVATE',
      isDM: true,
      isJoined: true,
      name: props.user?.username || 'Unknown'
    },
    members: [
      {
        id: loggedInUser.value.id,
        channel: null,
        friendship: null,
        muteExpireAt: new Date(),
        role: 'USER',
        status: 'ACCEPTED',
        user: loggedInUser.value
      },
      {
        id: props.user?.id || '',
        channel: null,
        friendship: null,
        muteExpireAt: new Date(),
        role: 'USER',
        status: 'ACCEPTED',
        user: props.user || ({} as User)
      }
    ],
    membersBanned: [],
    messages: [],
    hasNewUpdates: false,
    isNewDM: true
  }

  return newChat
}
</script>

<template>
  <div class="new-message" v-if="shouldApear">
    <slot :createChannel="createChannel" :loading="loading">
      <Button
        :class="[size]"
        class="new-message__btn bg-sky-500 text-white"
        :loading="loading"
        @click="createChannel"
      >
        <MessageCircle />
      </Button>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.new-message {
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
