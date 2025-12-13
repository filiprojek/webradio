<template>
  <div class="box-item">
    <h2>{{ header }}</h2>
    <p>{{ paragraph }}</p>
  </div>
</template>

<script setup>
defineProps({
  header: {
    type: String,
    required: true,
  },
  paragraph: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
/*
.box-item {
  background-color: var(--bg-elevated);
  padding: 1rem;
  border-radius: 15px;
}
*/

.box-item {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 1rem;
}
</style>
