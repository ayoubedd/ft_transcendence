<script lang="ts" setup>
import { Swords } from 'lucide-vue-next'

const router = useRouter()

const showBoards = ref(false)

const startNewGame = () => {
  router.push({ name: 'pong' })
}
</script>

<template>
  <div class="new-game">
    <slot :start="startNewGame">
      <Button @click="showBoards = true" class="new-game__btn">
        <Swords class="new-game__btn__icon" />
        <span class="new-game__btn__text">Start New Game</span>
      </Button>
    </slot>

    <Dialog v-model="showBoards">
      <div class="flex flex-col justify-center w-[700px] bg-background py-2 pb-6 rounded-sm">
        <h3
          class="text-2xl font-semibold mb-6 pb-3 text-gray-200 border-b-[1px] border-[#474953] px-4"
        >
          Choose game board
        </h3>

        <GameBoards />

        <div class="w-full flex justify-end gap-6 mx-auto mt-8 px-[60px]">
          <Button @click="showBoards = false" class="text-gray-300 hover:underline">
            Cancel
          </Button>

          <Button @click="startNewGame" class="btn-primary w-[150px] h-[38px] text-gray-100">
            <Swords class="mr-2 w-[18px] h-[18px]" />
            <span>Lessgo</span>
          </Button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style lang="scss" scoped>
.new-game {
  @apply h-full w-full flex items-center justify-center;

  &__btn {
    @apply bg-primary text-gray-100 font-medium text-base flex items-center justify-center;
    @apply py-1 px-10 rounded-sm capitalize;
  }

  &__btn__icon {
    @apply mr-4 w-[22px];
  }
}
</style>
