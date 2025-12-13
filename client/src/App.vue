<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <nav>
      <div class="nav-flx nav-left">
        <RouterLink to="/">Webradio</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </div>

      <div class="nav-flx nav-center"></div>

      <div class="nav-flx nav-right"></div>
    </nav>
  </header>

  <RouterView />
</template>

<style scoped>
nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: var(--bg-secondary);
}

.nav-flx {
  display: flex;
  gap: 2rem;
}

nav a {
  text-decoration: none;
  font-size: 1.2rem;
}
</style>
