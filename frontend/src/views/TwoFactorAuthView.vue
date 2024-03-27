<script setup lang="ts">
const toast = useToast()
const router = useRouter()

const code = ref<string>('')
const loading = ref(false)

const handleComplete = async () => {
  if (code.value.length !== 6) return
  try {
    loading.value = true
    await useAuthStore().TwoFactorAuth(code.value)
    await router.push({ name: 'home' })
  } catch (error: any) {
    loading.value = false
    toast.error('Failed to verify 2FA code')
  }
}
</script>

<template>
  <div class="two-factor-auth">
    <h2 class="text-2xl font-semibold">Two Factor Authentication</h2>
    <p class="text-gray-500 mt-2">Please Enter 2FA code from your authenticator app</p>

    <form @submit.prevent="handleComplete" class="flex flex-col items-center justify-center gap-4">
      <input
        v-model="code"
        placeholder="Enter Authenticator Code"
        class="px-3 py-2 border border-gray-600 rounded-md w-[300px] h-[40px] bg-[#373b3f] text-center"
        maxlength="6"
      />

      <Button class="mt-4 verify-btn" @click="handleComplete" :loading="loading"> Verify </Button>
    </form>
  </div>
</template>

<style lang="scss" scoped>
.two-factor-auth {
  @apply flex flex-col items-center justify-center gap-4 w-full h-[80vh];

  .verify-btn {
    @apply flex items-center justify-center bg-primary text-white w-[150px] h-[40px] rounded-md;
  }

  .input-4 {
    @apply ml-4;
  }
}
</style>
