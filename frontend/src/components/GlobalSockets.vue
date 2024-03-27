<script lang="ts" setup>
useSocketsStore().create('pong')
useSocketsStore().create('messages')
useSocketsStore().create('users')
</script>

<template>
  <ChatSocket />
  <GameSocket />
</template>
