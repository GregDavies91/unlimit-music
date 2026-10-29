<template>
  <div class="home">
    <main class="hero">
      <router-link to="/smplstcscntsts" class="card">
        <div class="photo placeholder">SS</div>
        <div class="minibio">
          <h1>Simplistic Scientists</h1>
          <p>Ambient / Electronic / Experimental. Exploring sound, space, and the metaverse.</p>
        </div>
      </router-link>
      <div class="tools">
        <router-link to="/chords">Unlimit Chords</router-link>
        <router-link to="/studio">Unlimit Studio</router-link>
      </div>
    </main>
    <footer class="foot">
      <span>info@unlimitmusic.com</span>
      <span>demos@unlimitmusic.com</span>
    </footer>
  </div>
</template>

<script setup></script>

<style scoped>
.home { height: 100vh; display: flex; flex-direction: column; background: #fff; color: #000; margin: 0; }
.hero { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; }
.card { display: grid; grid-template-columns: 260px 1fr; gap: 2rem; max-width: 720px; width: 100%; text-decoration: none; color: #000; align-items: center; }
.photo { width: 260px; height: 260px; }
.photo.placeholder { display: flex; align-items: center; justify-content: center; background: #f2f2f2; color: #aaa; font-family: monospace; font-size: 3rem; font-weight: 700; }
.minibio h1 { font-family: monospace; font-size: 1.6rem; text-transform: uppercase; margin-bottom: .5rem; }
.minibio p { color: #555; line-height: 1.5; }
.tools { display: flex; gap: 2rem; margin-top: 1.5rem; justify-content: center; }
.tools a { font-family: monospace; font-size: .75rem; text-transform: uppercase; letter-spacing: .1em; color: #888; text-decoration: none; }
.tools a:hover { color: #000; }
.foot { display: flex; justify-content: space-between; padding: 1rem 2rem; border-top: 1px solid #eee; font-size: .75rem; color: #888; font-family: monospace; }
@media (max-width: 700px) { .card { grid-template-columns: 1fr; } .photo { width: 180px; height: 180px; } }
</style>
