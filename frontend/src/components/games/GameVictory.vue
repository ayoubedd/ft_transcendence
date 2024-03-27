<script lang="ts" setup>
declare const JSConfetti: any
async function loadScript(src: string) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

onMounted(async () => {
  await loadScript('https://cdn.jsdelivr.net/npm/js-confetti@latest/dist/js-confetti.browser.js')

  const canvas = document.getElementById('cofetti') as HTMLCanvasElement
  const jsConfetti = new JSConfetti({ canvas })

  const count = 2

  for (let i = 0; i < count; i++) {
    jsConfetti.addConfetti({
      confettiColors: [
        '#f8b00c',
        '#f8e71c',
        '#f279c1',
        '#c5f71c',
        '#1cf7d4',
        '#1c8ef7',
        '#f71c1c',
        '#ff0a54',
        '#ff477e',
        '#ff7096'
      ],
      confettiNumber: 400,
      confettiRadius: 3
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
})
</script>

<template>
  <div class="game-victory">
    <canvas id="cofetti" class="absolute inset-0 w-full h-full z-0" />
    <div class="flex flex-col items-center justify-center gap-2 z-10">
      <h1>Victory!</h1>
      <p>You have won the game!</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.game-victory {
  @apply h-full w-full flex flex-col items-center justify-center relative py-12 gap-6;

  h1 {
    @apply text-8xl font-semibold text-gray-100;
  }

  p {
    @apply text-2xl font-medium text-gray-200;
  }
}
</style>
