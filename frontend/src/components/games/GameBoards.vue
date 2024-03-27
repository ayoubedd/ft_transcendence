<script setup lang="ts">
import { watchOnce } from '@vueuse/core'
import type { CarouselApi } from '@/components/ui/carousel'
import { boards } from '@/stores/games'

const { setBoard } = useGameStore()

function getBackground(b: (typeof boards)[0]) {
  return `url(${b.bg})`
}

const api = ref<CarouselApi>()
const totalCount = ref(0)
const current = ref(0)

function setApi(val: CarouselApi) {
  api.value = val
}

watchOnce(api, (api) => {
  if (!api) return

  totalCount.value = api.scrollSnapList().length
  current.value = api.selectedScrollSnap()

  api.on('select', () => {
    current.value = api.selectedScrollSnap()
    setBoard(current.value)
  })
})

onMounted(() => {
  setBoard(0)
})
</script>

<template>
  <Carousel @init-api="setApi" class="relative text-gray-100 w-full max-w-[580px] mx-auto">
    <CarouselContent class="w-full">
      <CarouselItem v-for="b in boards" :key="b.id">
        <div class="board-container">
          <div class="board-bg" v-if="b.bg" :style="{ backgroundImage: getBackground(b) }"></div>
          <div class="left-paddle"></div>
          <div class="right-paddle"></div>
          <div class="ball"></div>
        </div>
      </CarouselItem>
    </CarouselContent>
    <CarouselPrevious />
    <CarouselNext />
  </Carousel>
</template>

<style lang="scss" scoped>
.board-container {
  @apply relative flex items-center justify-center w-[580px] h-[300px];
  @apply rounded-md;
  @apply bg-[#44484e];
  @apply shadow-lg;
  @apply overflow-hidden;
  @apply border-2 border-transparent;
  @apply transition-all duration-300;
  @apply cursor-pointer;

  &:hover {
    @apply border-primary;
  }

  .board-bg {
    @apply w-full h-full;
    @apply absolute top-0 left-0;
    @apply bg-[#787878] rounded-sm opacity-60;
    background-position: center;
  }

  .left-paddle {
    @apply absolute left-1 w-2 h-16 bg-gray-100;
  }

  .right-paddle {
    @apply absolute right-1 w-2 h-16 bg-gray-100;
  }

  .ball {
    @apply absolute w-5 h-5 bg-gray-100 rounded-full;
  }
}
</style>
