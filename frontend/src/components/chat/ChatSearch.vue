<script lang="ts" setup>
import type { Chat, ChatItem } from '@/types/chat.types'
import { searchChannel } from '@/services/api/channels'
import { debounce } from '@/utils'
import { Loader2 } from 'lucide-vue-next'

const itemsFound = ref<ChatItem[]>([])
const searchQuery = ref('')
const loading = ref(false)
const showMenu = ref(false)
const searchMenu = ref<HTMLElement | null>(null)

async function search() {
  if (!searchQuery.value.length) return (itemsFound.value = [])

  loading.value = true
  const { data, error } = await searchChannel({
    name: searchQuery.value,
    limit: 10,
    offset: 0
  })

  if (error) {
    console.error(error)
    return
  }

  itemsFound.value = data.map((chat: Chat) => ({
    chat: chat,
    members: [],
    hasNewUpdates: false,
    membersBanned: [],
    messages: []
  }))

  loading.value = false
}

function removeItem(chat: ChatItem) {
  itemsFound.value = itemsFound.value.filter((item) => item.chat.id !== chat.chat.id)
}

const debouncedSearch = debounce(search, 500, false)

function closeOnOutsideClick(event: MouseEvent) {
  if (searchMenu.value && !searchMenu.value.contains(event.target as Node)) {
    showMenu.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', closeOnOutsideClick)
})

onUnmounted(() => {
  window.removeEventListener('click', closeOnOutsideClick)
})
</script>

<template>
  <div class="search" ref="searchMenu">
    <input
      v-model="searchQuery"
      @input="debouncedSearch"
      @focusin="showMenu = true"
      class="search__input"
      type="text"
      placeholder="Find your chat"
    />

    <div v-if="showMenu" class="search__menu">
      <div v-if="itemsFound.length" class="results">
        <ChannelJoin
          v-for="chat in itemsFound"
          :key="chat.chat.id"
          :chat="chat"
          @chat-joined="removeItem(chat)"
        />
      </div>

      <div v-else-if="loading" class="loader">
        <Loader2 class="animate-spin" />
      </div>

      <div v-else class="no-friends">No items found</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search {
  @apply flex items-center px-2 py-2.5 w-64 h-full relative;

  &__input {
    @apply border-none text-gray-300 bg-background2 px-2 py-1 rounded-sm w-full outline-none placeholder:text-sm text-sm;
  }

  &__menu {
    @apply absolute top-11 left-2 w-[122%] max-w-[330px] h-[400px] overflow-y-auto;
    @apply bg-background2 rounded-sm shadow-lg;
    @apply z-10;

    .results {
      @apply flex flex-col;
      @apply px-2 py-2;
    }

    .loader {
      @apply text-gray-400 flex w-full h-full items-center justify-center;
    }

    .no-friends {
      @apply text-gray-400 text-sm flex w-full h-full items-center justify-center;
    }
  }
}
</style>
