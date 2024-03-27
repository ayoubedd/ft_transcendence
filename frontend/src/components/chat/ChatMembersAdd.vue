<script setup lang="ts">
import type { User } from '@/types/user.types'
import { debounce } from '@/utils'

const toast = useToast()
const { activeChat } = storeToRefs(useChatStore())
const { fetchNonChatMembers } = useChatStore()

const friends = ref<User[]>([])
const searchQuery = ref('')

async function searchMember() {
  if (!searchQuery.value.length) return (friends.value = [])
  if (!activeChat.value) return
  try {
    const data = await fetchNonChatMembers(searchQuery.value)
    friends.value = data
  } catch (error: any) {
    toast.error(error.message)
  }
}

const debouncedSearchMember = debounce(searchMember, 500, false)
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger>
      <slot />
    </DropdownMenuTrigger>
    <DropdownMenuContent side="bottom" align="end" class="bg-background2 border-none">
      <div class="members-add">
        <div class="members-add__header">
          <h3 class="members-add__header__title">Add Members</h3>
        </div>
        <div class="members-add__body">
          <div class="members-add__body__search">
            <input
              type="text"
              placeholder="Find member"
              class="input"
              v-model="searchQuery"
              @input="debouncedSearchMember"
            />
          </div>
          <div class="members-add__body__list">
            <ChatMemberAdd v-for="friend in friends" :key="friend.id" :friend="friend" />

            <div v-if="!friends.length" class="text-center text-gray-300 pt-4">No users found</div>
          </div>
        </div>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<style lang="scss" scoped>
.members-add {
  @apply w-[360px] min-h-[200px];
  @apply bg-background2;

  &__header {
    @apply flex items-center justify-between;
    @apply px-4 py-2;
    @apply bg-background2;
    @apply border-b border-background2;
    @apply rounded-t-lg;
  }

  &__body {
    @apply px-4 py-2;

    &__search {
      @apply mb-4;

      & > input {
        @apply w-full py-1 px-2;
        @apply border-none bg-[#35383e];
        @apply rounded-sm outline-none;
      }
    }

    &__list {
      @apply flex flex-col gap-2.5 pr-1 max-h-[300px] overflow-y-auto;
    }
  }
}
</style>
