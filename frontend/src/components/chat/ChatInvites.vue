<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

const toast = useToast()
const { fetchChatInvites } = useChatStore()
const { chatInvites } = storeToRefs(useChatStore())

const loading = ref(false)

async function _fetchChatInvites() {
  if (chatInvites.value.length) return
  try {
    loading.value = true
    await fetchChatInvites()
    loading.value = false
  } catch (error: any) {
    toast.error(error?.message)
    loading.value = false
  }
}

onMounted(() => {
  _fetchChatInvites()
})
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger>
      <slot />
    </DropdownMenuTrigger>
    <DropdownMenuContent side="bottom" align="start" class="bg-background2 border-none">
      <div class="invites">
        <div class="invites__header">
          <h3 class="invites__header__title">New Invites</h3>
        </div>
        <div class="invites__body">
          <div class="invites__body__list">
            <ChatInviteItem v-for="invite in chatInvites" :key="invite.id" :invite="invite" />
          </div>
          <div
            class="h-full w-full flex items-center justify-center"
            v-if="!chatInvites.length || loading"
          >
            <Loader2 class="animate-spin" v-if="loading" />
            <h4 class="text-lg" v-else>No Invites Found</h4>
          </div>
        </div>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<style lang="scss" scoped>
.invites {
  @apply w-[360px] h-[400px] py-1;
  @apply bg-background2;

  &__header {
    @apply flex items-center justify-between;
    @apply mx-2 px-1 pb-2;
    @apply bg-background2;
    @apply border-b-2 border-background;
  }

  &__body {
    @apply px-2.5 py-2 h-[350px] mt-2.5;

    &__list {
      @apply flex flex-col gap-0 pr-2 max-h-full overflow-y-auto;
    }
  }
}
</style>
