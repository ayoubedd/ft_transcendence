<script lang="ts" setup>
import type { User } from '@/types/user.types'
import { UserPlus2, PlusCircle, UserCheck2 } from 'lucide-vue-next'

const props = defineProps<{
  user?: User
  variant?: 'icon'
}>()

const toast = useToast()
const { user: loggedInUser } = storeToRefs(useAuthStore())
const { requestFriend } = useFriendStore()
const loading = ref(false)
const added = ref(false)

const shouldApear = computed(() => {
  const _status = props.user?.friendship?.status
  return props.user?.id !== loggedInUser.value.id && (!_status || _status != 'ACCEPTED')
})

async function addFriend() {
  try {
    loading.value = true
    await requestFriend({
      him: props.user?.id || ''
    })
    added.value = true
    loading.value = false
    toast.success('Friend request sent')
  } catch (error: any) {
    toast.error(error?.message)
    loading.value = false
  }
}
</script>

<template>
  <div class="friend-add-remove" v-if="shouldApear">
    <slot name="add">
      <Button
        class="friend-add-remove__btn bg-primary text-gray-100"
        :class="[variant]"
        @click="addFriend"
        :loading="loading"
        :disabled="
          user?.friendship?.status == 'PENDING' || user?.friendship?.status == 'BLOCKED' || added
        "
      >
        <template v-if="user?.friendship?.status == 'PENDING'">
          <UserCheck2 v-if="variant === 'icon'" />
          <span v-else>Request Sent</span>
        </template>
        <template v-else-if="user?.friendship?.status == 'BLOCKED'">
          <span>Blocked</span>
        </template>
        <template v-else>
          <UserPlus2 v-if="variant === 'icon'" />
          <template v-else>
            <PlusCircle />
            <span>Add Friend</span>
          </template>
        </template>
      </Button>
    </slot>
    <!-- <slot name="remove">
      <Button class="bg-slate-600 text-gray-100">
        <UserMinus2 />
        <span>Remove Friend</span>
      </Button>
    </slot> -->
  </div>
</template>

<style lang="scss" scoped>
.friend-add-remove {
  display: flex;

  &__btn {
    @apply flex gap-3 px-4 py-2 h-10 rounded-sm text-base font-medium;

    &.icon {
      @apply px-2 py-1 h-8;
    }
  }
}
</style>
