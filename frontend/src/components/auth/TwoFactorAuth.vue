<script lang="ts" setup>
import QRCode from 'qrcode'
import { ref } from 'vue'
import authApi from '@/services/api/auth'

const toast = useToast()
const { user } = storeToRefs(useAuthStore())
const { updateProfile } = useProfileStore()

const qrCodeCanvas = ref<HTMLCanvasElement | null>(null)

async function getQRCode() {
  const { data, error } = await authApi.twoFactorQr()

  if (error) return Promise.reject(error)

  return Promise.resolve(data)
}

const showTwoFactorAuth = ref(false)
const code = ref('')
const loading = ref(false)

async function scrollToBottom() {
  await nextTick()
  const el = document.querySelector('.account-settings') as HTMLElement
  if (el) {
    el.style.scrollBehavior = 'smooth'
    el.scrollTo(0, el.scrollHeight)
  }
}

async function enable2FA() {
  if (!showTwoFactorAuth.value) {
    try {
      const data = await getQRCode()

      QRCode.toCanvas(qrCodeCanvas.value!, data.url, (error: any) => {
        if (error) {
          toast.error('Failed to generate QR code')
          return
        }
      })

      showTwoFactorAuth.value = true
      scrollToBottom()
      return
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  if (code.value.length !== 6) return
  try {
    loading.value = true
    const { error } = await authApi.twoFactorEnable(code.value)
    if (error) throw new Error(`Failed to enable 2FA: ${error.message}`)
    toast.success('2FA enabled successfully')
    showTwoFactorAuth.value = false
    loading.value = false
    await useAuthStore().logout()
  } catch (error: any) {
    loading.value = false
    toast.error(error.message)
  }
}

async function disable2FA() {
  try {
    loading.value = true
    await updateProfile({ '2FA': false })
    toast.success('2FA disabled successfully')
    loading.value = false
  } catch (error: any) {
    toast.error(error.message)
    loading.value = false
  }
}
</script>

<template>
  <div class="two-factor-auth">
    <Button
      class="two-factor-auth__button"
      @click="enable2FA"
      v-if="!user['2FA']"
      :loading="loading"
    >
      Enable 2FA
    </Button>

    <Button class="two-factor-auth__button" @click="disable2FA" v-else :loading="loading">
      Disable 2FA
    </Button>

    <div class="two-factor-auth__content" v-show="showTwoFactorAuth">
      <canvas ref="qrCodeCanvas" alt="QR code" class="two-factor-auth__content__qr-code" />
      <p class="two-factor-auth__content__text">
        Scan the QR code with your authenticator app to enable 2FA
      </p>

      <div class="two-factor-auth__content__input">
        <form @submit.prevent="enable2FA">
          <input
            v-model="code"
            placeholder="Enter code from your authenticator app"
            maxlength="6"
          />
          <Button class="two-factor-auth__content__input__button" :loading="loading">
            Verify
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.two-factor-auth {
  @apply flex flex-col text-gray-200;

  &__button {
    @apply w-[160px] h-[40px] bg-[#5765F2] px-2.5 text-white rounded-sm hover:bg-[#4c58da] transition-all duration-200;
  }

  &__content {
    @apply flex flex-col bg-[#373A3F] p-6 rounded-[8px] mt-6;
  }

  &__content__qr-code {
    @apply w-40 h-40 border-[1px] border-gray-500 rounded-[8px] bg-white;
  }

  &__content__text {
    @apply mt-4;
  }

  &__content__input {
    @apply mt-4;

    input {
      @apply w-[440px] h-[40px] bg-[#323338] text-gray-200 px-2 py-1 rounded-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
    }
  }

  &__content__input__button {
    @apply flex justify-center mt-4 bg-primary w-[160px] h-[40px] text-white rounded-sm hover:bg-[#4c58da] transition-all duration-200;
  }
}
</style>
