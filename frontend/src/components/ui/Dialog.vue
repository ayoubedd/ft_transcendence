<script lang="ts">
export default {
  inheritAttrs: false
}
</script>
<script setup lang="ts">
defineProps<{
  modelValue?: boolean
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
const emit_ = (value: boolean) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <teleport to="#dialogs">
    <div v-if="modelValue" class="overlay" v-bind="$attrs"></div>
    <transition name="scale">
      <div v-if="modelValue" class="modal" @click.self="emit_(false)">
        <slot />
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.modal {
  --bg: var(--color-background-soft, #fff);
  --shadow: rgba(22, 30, 50, 0.15);
  --border-raduis: 10px;
  --arrow-color: var(--color-text, #000);
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 14;
  display: flex;
  align-items: center;
  justify-content: center;
}
body[data-light='true'] .modal {
  --bg: var(--color-background, #fff);
}
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 14;
  filter: blur(10px);
  background: rgba(0, 0, 0, 0.5);
}
.scale-enter-active,
.scale-leave-active {
  transition: all 0.25s;
}
.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0);
}
</style>
