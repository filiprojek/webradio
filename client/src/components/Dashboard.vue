<script setup lang="ts">
import BoxItem from '../components/BoxItem.vue'
</script>

<template>
  <section class="dashboard">
    <h1>Dashboard</h1>

    <div class="section stream-status">
      <h2>Live streaming</h2>
    </div>

    <div class="section">
      <h2>Curently playing</h2>
      <p>Linkin Park - Over each other</p>
    </div>

    <div class="section">
      <h2>Stream controls</h2>
      <button>Start stream</button>
      <button>Enable microphone</button>
    </div>

    <div class="playlists">
      <BoxItem header="Playlist Name" paragraph="Description" />
      <BoxItem header="From Zero" />
      <BoxItem header="One More Light" />
      <BoxItem header="Hybrid Theory" />
      <BoxItem header="Hybrid Theory" />
      <BoxItem header="Hybrid Theory" />
      <BoxItem header="Hybrid Theory" />
      <BoxItem header="Hybrid Theory" />
      <BoxItem header="Hybrid Theory" />
      <BoxItem header="Hybrid Theory" />
      <BoxItem header="Hybrid Theory" />
      <BoxItem header="Hybrid Theory" />
      <BoxItem header="Hybrid Theory" />
      <BoxItem header="Hybrid Theory" />
    </div>
  </section>
</template>

<style scoped>
.dashboard {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 1rem;
}

.playlists {
  width: 100%;
  max-width: 1200px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.stream-status h2 {
  color: red;
}

:deep(.box-item) {
  cursor: pointer;
}
</style>
