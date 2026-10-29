<template>
  <div class="redirect">Loading Unlimit Chords…</div>
</template>

<script setup>
import { onMounted } from 'vue'
onMounted(() => { window.location.href = '/chords/' })
</script>

<style scoped>
.redirect { display: flex; align-items: center; justify-content: center; height: 100vh; font-family: monospace; color: #8a8a8a; }
</style>
