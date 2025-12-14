<script setup lang="ts">
import Client from '../components/Client.vue'
</script>

<template>
  <main class="player-wrapper">
    <Client />
  </main>
</template>

<style scoped>
.player-wrapper {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
