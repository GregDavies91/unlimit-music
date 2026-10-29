<template>
  <div class="app">
    <header class="topbar">
      <a href="/" class="logo">UNLIMIT MUSIC</a>
      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/chords">Chords</router-link>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup></script>

<style scoped>
.topbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; border-bottom: 1px solid #e5e3df; }
.logo { font-family: monospace; font-weight: 700; text-decoration: none; color: #1a1a1a; }
nav { display: flex; gap: 1.5rem; }
nav a { text-decoration: none; color: #8a8a8a; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; }
nav a.router-link-active { color: #1a1a1a; }
</style>
