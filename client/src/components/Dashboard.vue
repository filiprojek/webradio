<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BoxItem from '../components/BoxItem.vue'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000'

type Status = {
  playing: boolean
  playlist: string | null
}

const playlists = ref<string[]>([])
const status = ref<Status>({ playing: false, playlist: null })
const loading = ref(false)

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(API_BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

async function loadPlaylists() {
  const data = await api<{ playlists: string[] }>('/api/playlists')
  playlists.value = data.playlists
}

async function loadStatus() {
  status.value = await api<Status>('/api/status')
}

async function playPlaylist(name: string) {
  try {
    loading.value = true
    await api('/api/play', {
      method: 'POST',
      body: JSON.stringify({ playlist: name }),
    })
    await loadStatus()
  } catch (e) {
    console.error(e)
    alert('Failed to start playlist')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadPlaylists()
  await loadStatus()
})
</script>

<template>
  <section class="dashboard">
    <h1>Dashboard</h1>

    <div class="section stream-status">
      <h2>
        Live streaming:
        <span v-if="status.playing" class="on">ON</span>
        <span v-else class="off">OFF</span>
      </h2>
    </div>

    <div class="section">
      <h2>Currently playing</h2>
      <p v-if="status.playlist">{{ status.playlist }}</p>
      <p v-else>Nothing</p>
    </div>

    <div class="playlists">
      <BoxItem
        v-for="p in playlists"
        :key="p"
        :header="p"
        paragraph="Click to play"
        :class="{ active: status.playlist === p }"
        @click="playPlaylist(p)"
      />
    </div>

    <p v-if="loading">Switching playlist…</p>
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

.stream-status .on {
  color: #3fb950;
}
.stream-status .off {
  color: #f85149;
}

:deep(.box-item) {
  cursor: pointer;
  transition:
    border 0.2s,
    background 0.2s;
}

:deep(.box-item:hover) {
  border-color: var(--accent-primary);
}

:deep(.box-item.active) {
  border-color: var(--accent-primary);
  background: var(--bg-elevated);
}
</style>
