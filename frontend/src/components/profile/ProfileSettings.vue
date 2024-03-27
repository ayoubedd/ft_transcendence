<script lang="ts" setup>
import { PenBox, Save } from 'lucide-vue-next'

const toat = useToast()
const { user } = storeToRefs(useAuthStore())
const { updateProfile, uploadAvatar } = useProfileStore()

const formData = ref({
  username: user.value.username,
  firstname: user.value.firstname,
  lastname: user.value.lastname,
  bio: user.value.bio
})
const loading = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)
const file = ref<File | null>(null)
const avatar = ref<string>(user.value.avatar)

const isChanged = computed(() => {
  return (
    formData.value.username !== user.value.username ||
    formData.value.firstname !== user.value.firstname ||
    formData.value.lastname !== user.value.lastname ||
    formData.value.bio !== user.value.bio ||
    !!file.value
  )
})

const isFilled = computed(() => {
  return formData.value.username
})

function showFilePicker() {
  avatarInput.value?.click()
}

async function _handleSubmit() {
  if (!isChanged.value) return

  try {
    loading.value = true
    await updateProfile(formData.value)
    if (file.value) await uploadAvatar(file.value)
    loading.value = false
    toat.success('Profile updated successfully')
  } catch (error: any) {
    toat.error(error?.message)
    loading.value = false
  }
}

function handleFileChange() {
  const files = avatarInput.value?.files

  if (!files || !files?.length) return

  file.value = files[0]

  const url = URL.createObjectURL(files[0])
  avatar.value = url
}
</script>

<template>
  <div class="profile-settings">
    <form @submit.prevent="_handleSubmit">
      <div class="profile-settings__header">
        <Avatar
          class="profile-settings__header__avatar"
          size="xl"
          :user="user"
          :avatar="avatar"
          :popover="false"
          :status="false"
        />
        <span class="profile-settings__header__username">{{ user.username }}</span>
        <Button type="button" class="profile-settings__header__change" @click="showFilePicker">
          <PenBox />
          <span class="visually-hidden">Change Avatar</span>
        </Button>

        <input
          type="file"
          accept="image/*"
          class="hidden"
          ref="avatarInput"
          @change="handleFileChange"
        />
      </div>
      <div class="profile-settings__info">
        <div class="profile-settings__info__username">
          <label for="username">Username</label>
          <input maxlength="15" type="text" id="username" v-model.trim="formData.username" />
        </div>
        <div class="profile-settings__info__firstname">
          <label for="firstname">First Name</label>
          <input maxlength="20" type="text" id="firstname" v-model.trim="formData.firstname" />
        </div>
        <div class="profile-settings__info__lastname">
          <label for="lastname">Last Name</label>
          <input maxlength="20" type="text" id="lastname" v-model.trim="formData.lastname" />
        </div>
        <div class="profile-settings__info__bio">
          <label for="bio">About me</label>
          <textarea maxlength="120" id="bio" v-model.trim="formData.bio"></textarea>
        </div>
        <div class="profile-settings__actions">
          <Button
            class="profile-settings__actions__button"
            :loading="loading"
            :disabled="!isChanged || !isFilled"
          >
            <Save />
            <span>Save</span>
          </Button>
        </div>
      </div>
    </form>
  </div>
</template>

<style lang="scss" scoped>
.profile-settings {
  @apply w-full h-full;
  @apply bg-background2;
  @apply rounded-sm;

  &__header {
    @apply bg-[#386edc] flex w-full h-[110px] rounded-tl-sm rounded-tr-sm relative;

    :deep(.profile-settings__header__avatar) {
      @apply absolute -bottom-16 left-4;
      @apply border-4 border-background2;
    }

    &__username {
      @apply absolute -bottom-[64px] left-32;
      @apply text-gray-400 text-2xl font-bold;
      @apply h-16 max-w-[500px] truncate;
    }

    &__change {
      @apply bg-[#171717a2] w-[94px] h-[94px] rounded-full flex items-center justify-center;
      @apply absolute -bottom-[61px] left-[19px] text-gray-50;
      @apply hover:bg-[#171717c4] transition-all duration-200;
    }
  }

  &__info {
    @apply flex flex-col bg-[#2B2D31] mt-20 mb-4  mx-4 px-4 py-5 rounded-sm;

    &__username,
    &__firstname,
    &__lastname,
    &__bio {
      @apply flex flex-col items-start justify-center;
      @apply mb-5;

      & > label {
        @apply text-xs text-gray-400 uppercase font-bold;
        @apply mb-2 px-0.5;
      }

      & > input,
      & > textarea {
        @apply w-full;
        @apply bg-[#383a3f];
        @apply text-gray-200;
        @apply px-2.5 py-1.5;
        @apply rounded-sm;
        @apply border border-transparent;
        @apply focus:outline-none;
        @apply focus:ring-2 focus:ring-blue-500;
        @apply focus:border-transparent;
      }
    }

    &__bio {
      & > textarea {
        @apply h-28;
      }
    }
  }

  &__actions {
    @apply ml-auto;

    &__button {
      @apply flex items-center justify-center gap-2;
      @apply px-4 py-1 w-[120px];
      @apply bg-[#5765F2];
      @apply text-white;
      @apply rounded-sm;
      @apply hover:bg-[#505ce0];
      @apply transition-all duration-200;

      svg {
        @apply w-[18px] h-[18px];
      }
    }
  }
}
</style>
