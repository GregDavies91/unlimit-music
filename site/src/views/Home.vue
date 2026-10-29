<template>
  <div class="home">
    <header class="topbar">
      <img src="/logo.svg" alt="Unlimit Music" class="logo" />
      <nav>
        <router-link to="/">Label</router-link>
        <router-link to="/smplstcscntsts">smplstcscntsts</router-link>
        <router-link to="/chords">Chords</router-link>
        <router-link to="/studio">Studio</router-link>
      </nav>
    </header>
    <main class="hero">
      <router-link to="/smplstcscntsts" class="card">
        <div class="photo placeholder">SS</div>
        <div class="minibio">
          <h1>smplstcscntsts</h1>
          <p>Ambient / Electronic / Experimental. Simplistic Scientists — exploring sound, space, and the metaverse.</p>
        </div>
      </router-link>
    </main>
    <footer class="foot">
      <span>info@unlimitmusic.com</span>
      <span>demos@unlimitmusic.com</span>
    </footer>
  </div>
</template>

<script setup></script>

<style scoped>
.home { height: 100vh; display: flex; flex-direction: column; background: #fff; color: #000; }
.topbar { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 2rem; border-bottom: 1px solid #eee; }
.logo { height: 28px; }
nav { display: flex; gap: 1.5rem; }
nav a { text-decoration: none; color: #000; font-size: .8rem; text-transform: uppercase; letter-spacing: .1em; opacity: .6; }
nav a:hover, nav a.router-link-active { opacity: 1; }
.hero { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; }
.card { display: grid; grid-template-columns: 260px 1fr; gap: 2rem; max-width: 720px; width: 100%; text-decoration: none; color: #000; align-items: center; }
.photo { width: 260px; height: 260px; object-fit: cover; }
.photo.placeholder { display: flex; align-items: center; justify-content: center; background: #f2f2f2; color: #aaa; font-family: monospace; font-size: 3rem; font-weight: 700; }
.minibio h1 { font-family: monospace; font-size: 1.6rem; text-transform: uppercase; margin-bottom: .5rem; }
.minibio p { color: #555; line-height: 1.5; }
.foot { display: flex; justify-content: space-between; padding: 1rem 2rem; border-top: 1px solid #eee; font-size: .75rem; color: #888; font-family: monospace; }
@media (max-width: 700px) { .card { grid-template-columns: 1fr; } .photo { width: 180px; height: 180px; } }
</style>
