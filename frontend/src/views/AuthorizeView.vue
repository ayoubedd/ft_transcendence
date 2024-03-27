<script lang="ts" setup>
const route = useRoute()
const router = useRouter()
const { login } = useAuthStore()

onMounted(async () => {
  try {
    const code = route.query.code as string
    if (!code) return router.push({ name: 'login' })
    await login(code)
  } catch (error) {
    router.push({ name: 'login' })
  }
})
</script>

<template>
  <Loader3D />
</template>
