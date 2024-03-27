<script lang="ts" setup>
const { friends } = storeToRefs(useFriendStore())
</script>

<template>
  <div class="friends-list">
    <UserItem v-for="friend in friends" :key="friend.id" :user="friend" :status="true" />

    <div v-if="!friends.length" class="text-center text-gray-500">No friends found</div>
  </div>
</template>

<style lang="scss" scoped>
.friends-list {
  @apply flex flex-col gap-2;
  @apply pl-2 pr-1 py-1;
}
</style>
