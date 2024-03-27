<script lang="ts" setup>
import InfiniteLoading from 'v3-infinite-loading'
import { Loader2 } from 'lucide-vue-next'
</script>

<template>
  <InfiniteLoading>
    <template #spinner>
      <div class="my-2 w-full flex justify-center">
        <Loader2 class="animate-spin" />
      </div>
    </template>
    <template #complete>
      <slot name="complete"></slot>
    </template>

    <template #error="{ retry }">
      <div class="text-gray-400 text-center text-sm flex flex-col gap-2 items-center">
        <span>Oops! Something went wrong</span>
        <Button class="text-gray-300 px-4 py-1 gap-2 border-[1px] border-gray-600" @click="retry">
          Retry
        </Button>
      </div>
    </template>
  </InfiniteLoading>
</template>
