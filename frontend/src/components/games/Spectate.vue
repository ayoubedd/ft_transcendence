<script lang="ts" setup>
import { cn } from '@/lib/utils'
import { getGame } from '@/services/api/games'
import { ScanEye } from 'lucide-vue-next'

const router = useRouter()
const toast = useToast()
const props = defineProps<{
  gameId?: string
  userId?: string
  isGameCard?: boolean
  variant?: 'icon'
  size?: 'lg'
}>()

const loading = ref(false)
const matchId = ref<string | undefined>(props.gameId)
const shouldAprear = computed(() => props.isGameCard || props.userId != useAuthStore().user?.id)

async function fetchGame() {
  if (!props.userId) return Promise.reject({ message: 'User ID is required' })
  loading.value = true
  const { data, error } = await getGame({ userId: props.userId })
  loading.value = false
  if (error) return Promise.reject(error)

  matchId.value = data?.matchId
}

async function spectate() {
  try {
    if (!matchId.value) await fetchGame()
    router.push({ name: 'pong', params: { mode: 'spectate' }, query: { match: matchId.value } })
  } catch (error: any) {
    toast.error(error.message)
  }
}
</script>

<template>
  <div class="spectate" :class="[variant, size]" v-if="shouldAprear">
    <Button class="spectate__link" :loading="loading" @click="spectate">
      <ScanEye class="w-5 h-5" />
      <span :class="cn(variant == 'icon' && 'sr-only')">Spectate</span>
    </Button>
  </div>
</template>

<style lang="scss" scoped>
.spectate {
  @apply text-gray-300;
  @apply cursor-pointer;
  @apply transition-colors duration-300;
  @apply hover:text-gray-100;

  &.icon &__link {
    @apply w-10 h-8;
  }

  &.lg &__link {
    @apply w-12 h-10;
  }

  &__link {
    @apply text-base bg-primary py-1 rounded-sm flex items-center justify-center gap-3 w-36;
    @apply transition-colors duration-300;

    &.disabled {
      @apply cursor-not-allowed opacity-40;
    }
  }
}
</style>
