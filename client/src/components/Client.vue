<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const DEFAULT_STREAM_URL = 'http://localhost:8000/radio'
const STORAGE_KEY = 'radio-stream-url'

const audio = ref<HTMLAudioElement | null>(null)
const streamUrl = ref(DEFAULT_STREAM_URL)
const playing = ref(false)
const status = ref<'idle' | 'playing' | 'reconnecting'>('idle')

let retryTimer: number | null = null

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) streamUrl.value = saved

  if (!audio.value) return
  audio.value.preload = 'none'

  audio.value.addEventListener('ended', () => reloadStream(1000))
  audio.value.addEventListener('error', () => reloadStream(1500))
})

onBeforeUnmount(() => stop())

function saveUrl() {
  localStorage.setItem(STORAGE_KEY, streamUrl.value)
}

function clearRetry() {
  if (retryTimer !== null) {
    clearTimeout(retryTimer)
    retryTimer = null
  }
}

function reloadStream(delay = 0) {
  clearRetry()

  retryTimer = window.setTimeout(() => {
    if (!audio.value) return

    status.value = 'reconnecting'
    playing.value = false

    audio.value.pause()
    audio.value.src = `${streamUrl.value}?t=${Date.now()}`
    audio.value.load()

    audio.value
      .play()
      .then(() => {
        status.value = 'playing'
        playing.value = true
      })
      .catch(() => {
        reloadStream(1000)
      })
  }, delay)
}

function play() {
  reloadStream(0)
}

function stop() {
  clearRetry()
  if (!audio.value) return

  audio.value.pause()
  audio.value.src = ''
  playing.value = false
  status.value = 'idle'
}
</script>

<template>
  <section class="radio-player">
    <h2>Live Radio</h2>

    <audio ref="audio" />

    <label class="url-input">
      <p>Stream URL</p>
      <div class="inp-url">
        <input v-model="streamUrl" type="url" placeholder="http://localhost:8000/radio" />
        <button class="save" @click="saveUrl">Save URL</button>
      </div>
    </label>

    <div class="controls">
      <button @click="play" :disabled="status === 'playing'">▶ Play</button>
      <button @click="stop">■ Stop</button>
    </div>

    <p class="status">
      <p>Status:</p>
      <span v-if="status === 'playing'" class="ok">Playing</span>
      <span v-else-if="status === 'reconnecting'" class="warn">Reconnecting…</span>
      <span v-else class="off">Stopped</span>
    </p>
  </section>
</template>

<style scoped>
.radio-player {
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  padding: 1.25rem;
  width: 100%;
  max-width: 420px;

  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}

.url-input {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

input {
  padding: 0.55rem 0.6rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
  border-radius: 6px;
  font-size: 0.9rem;
}

input:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.inp-url {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 1rem;
}

.inp-url input {
  width: 80%;
}

.controls {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 0.5rem;
}

button {
  appearance: none;
  border: 1px solid var(--border-default);
  background: var(--bg-elevated);
  color: var(--text-primary);
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    transform 0.05s ease;
}

button:hover {
  border-color: var(--accent-primary);
}

button:active {
  transform: translateY(1px);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button:first-child {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
}

button:first-child:hover {
  background: var(--accent-primary-hover);
}

.save {
  align-self: flex-end;
  font-size: 0.85rem;
  padding: 0.35rem 0.75rem;
}

.status {
  text-align: center;
  font-size: 0.85rem;
}

.ok {
  color: #3fb950;
}
.warn {
  color: #d29922;
}
.off {
  color: #f85149;
}
</style>
