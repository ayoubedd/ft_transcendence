<script setup lang="ts">
import particlesConfig, { loadScript } from '@/utils/particlesConfig'
import Button from '@/components/ui/Button.vue'

const { updateStrategy } = useAuthStore()
const loading = ref(false)
const loginBtn = ref<InstanceType<typeof Button> | null>(null)

const particlesCDN = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js'

async function authorize(strategy: string) {
  if (loading.value) return
  loading.value = true
  updateStrategy(strategy)
  const link = `${import.meta.env.VITE_API_URL}/auth/login?strategy=${strategy}`

  window.location.href = link
}

onMounted(async () => {
  try {
    await nextTick()
    await loadScript(particlesCDN)
    particlesJS('particles-js', particlesConfig)
  } catch (error) {
    console.log(`Maximum calls to ${particlesCDN} exceeded!`)
  }
})
</script>

<template>
  <div class="login-view">
    <div id="particles-js" class="dark"></div>
    <div class="flex flex-col items-center justify-center z-10 mt-28">
      <Button ref="loginBtn" class="login-btn" @click="authorize('42')">
        <span class="flex items-center justify-center">
          <span> Login with</span>
          <Icon42 class="w-6 h-6 ml-2 mt-[2px]" />
        </span>
      </Button>

      <span class="mt-8 text-xs font-bold text-center text-white">Or</span>

      <Button
        class="px-4 mt-8 py-2 bg-transparent border-2 border-[#4285f4] rounded-sm hover:bg-[#4286f425] transition-colors duration-300"
        @click="authorize('google')"
      >
        <IconGoogle class="w-6 h-6 mr-2" />
        <span> Continue with Google</span>
      </Button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-view {
  position: relative;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;

  canvas {
    display: block;
  }
  /* ---- particles.js container ---- */
  #particles-js {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: hsl(var(--background));
    background-image: url('@/assets/images/pong.gif');
    background-repeat: no-repeat;
    background-size: 220px;
    background-position: 50% 28%;
  }

  .login-btn {
    display: inline-block;
    padding: 10px 30px;
    font-size: 22px;
    font-weight: bold;
    text-align: center;
    text-decoration: none;
    position: relative;
    cursor: pointer;
    border: 2px solid hsl(var(--primary));
    color: #dadaec;
    background-color: #5032d455;
    border-radius: 5px;
    box-shadow:
      0 0 10px rgba(53, 47, 225, 0.5),
      0 0 40px rgba(53, 47, 225, 0.5),
      0 0 80px rgba(53, 47, 225, 0.5);
    transition:
      background-color 0.3s,
      color 0.3s,
      transform 0.3s;

    & > span {
      position: relative;
      z-index: 2;
    }

    &[disabled] {
      cursor: not-allowed;
      background-color: #5032d455;
      color: #dadaec;
      transform: scale(0.95);
    }

    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, #4429c0, #b41212);
      clip-path: polygon(0 0, 100% 0, 0 100%);
      z-index: 1;
      transition: clip-path 0.3s;
    }
  }
}
</style>

<style>
.login-btn--block {
  position: absolute;
  width: 25px;
  height: 25px;
  background: linear-gradient(45deg, #267ad32f, #4923f42a);
  border-radius: 50%;
  opacity: 0.4;
  z-index: 2;
  animation: blockAnimation 0.5s linear infinite alternate;
}

@keyframes blockAnimation {
  to {
    opacity: 0;
  }
}
</style>
