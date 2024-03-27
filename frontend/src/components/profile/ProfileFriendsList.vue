<script lang="ts" setup>
const { fetchFriends } = useProfileStore()
const { activeProfile } = storeToRefs(useProfileStore())

const getUsername = computed(() => {
  if (activeProfile.value?.user.id == useAuthStore().user?.id) return 'Your'
  return `${activeProfile.value?.user.username}'s`
})

async function _fetchFriends($state: any) {
  if (!activeProfile.value) return $state.complete()

  try {
    const res = await fetchFriends({
      userId: activeProfile.value.user.id,
      username: activeProfile.value.user.username,
      limit: 10,
      offset: activeProfile.value.friends.length
    })

    if (res?.length) $state.loaded()
    else $state.complete()
  } catch (error) {
    $state.error()
  }
}
</script>

<template>
  <div class="friends-list">
    <div class="friends-list__title">
      <span class="text-gray-400">{{ getUsername }} friends</span>
    </div>
    <UserItem
      v-for="friend in activeProfile?.friends"
      :key="friend.id"
      :user="friend"
      :status="true"
    />
    <InfiniteLoading
      :slots="{ complete: ' ' }"
      @infinite="_fetchFriends"
      :identifier="activeProfile?.user?.id"
      :style="{ minHeight: 'auto' }"
    >
      <template #complete>
        <div v-if="!activeProfile?.friends.length" class="text-center text-gray-500">
          No friends found
        </div>
      </template>
    </InfiniteLoading>
  </div>
</template>

<style lang="scss" scoped>
.friends-list {
  @apply flex flex-col gap-2;
  @apply pl-2 pr-1 py-1;

  &__title {
    @apply pl-1.5 mt-2 font-medium uppercase text-sm text-gray-400 relative;
  }
}
</style>
