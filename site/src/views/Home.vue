<template>
  <!-- v2 -->
  <div class="home">
    <header class="topbar">
      <img src="/logo.svg" alt="Unlimit Music" class="logo" />
      <a href="/chords/" target="_blank" rel="noopener" class="tool">Songwriting Tool</a>
    </header>
    <main class="wrap">
      <a href="/studio/" target="_blank" rel="noopener" class="card">
        <div class="photo placeholder">SS</div>
        <div class="info">
          <h1>Simplistic Scientists</h1>
          <div class="genre">Indie Rock / Trip Hop</div>
          <p class="bio">Exploring sound, space, and the metaverse.</p>
        </div>
      </a>
    </main>
    <footer class="foot">
      <span>info@unlimitmusic.com</span>
      <span>demos@unlimitmusic.com</span>
    </footer>
  </div>
</template>

<script setup>
const _v = 'v7' // cache bust
</script>

<style scoped>
.home { height: 100vh; width: 100%; display: flex; flex-direction: column; background: #fff; color: #000; margin: 0; overflow: hidden; font-family: 'Inter', system-ui, sans-serif; }
.topbar { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; background: #fff; flex-wrap: wrap; gap: 1rem; }
.tool { font-family: 'Space Mono', monospace; font-size: .8rem; text-transform: uppercase; letter-spacing: .1em; color: #999; text-decoration: none; transition: color .2s; }
.tool:hover { color: #000; }
.wrap { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: safe center; gap: 2.5rem; padding: 2rem; background: #fff; }
.logo { height: 28px; }
.card { display: grid; grid-template-columns: 200px 1fr; gap: 2rem; max-width: 640px; width: 100%; text-decoration: none; color: #000; align-items: center; }
.photo { width: 200px; height: 200px; background: #f2f2f2; }
.photo.placeholder { display: flex; align-items: center; justify-content: center; color: #bbb; font-family: 'Space Mono', monospace; font-size: 2.5rem; font-weight: 700; }
.info h1 { font-family: 'Space Mono', monospace; font-size: 1.6rem; font-weight: 700; text-transform: uppercase; margin-bottom: .25rem; }
.genre { font-family: 'Space Mono', monospace; font-size: .75rem; color: #999; text-transform: uppercase; letter-spacing: .1em; margin-bottom: .75rem; }
.bio { color: #555; line-height: 1.6; }
.tools { display: flex; gap: 2.5rem; }
.tools a { font-family: 'Space Mono', monospace; font-size: .8rem; text-transform: uppercase; letter-spacing: .1em; color: #999; text-decoration: none; transition: color .2s; }
.tools a:hover { color: #000; }
.foot { display: flex; justify-content: space-between; padding: 1.5rem 2rem; font-size: .7rem; color: #bbb; font-family: 'Space Mono', monospace; letter-spacing: .1em; background: #fff; }
@media (max-width: 700px) { .card { grid-template-columns: 1fr; text-align: center; } .photo { margin: 0 auto; } }
</style>
