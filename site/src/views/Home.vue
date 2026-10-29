<template>
  <div class="home">
    <header class="topbar">
      <a href="/" class="logo"><img src="/logo.svg" alt="Unlimit Music" style="height:20px;" /></a>
      <nav>
        <router-link to="/">Label</router-link>
        <router-link to="/smplstcscntsts">smplstcscntsts</router-link>
        <router-link to="/chords">Unlimit Chords</router-link>
        <router-link to="/studio">Unlimit Studio</router-link>
      </nav>
    </header>
    <main class="wrap">
      <section class="artist">
        <div class="photo placeholder">SS</div>
        <div class="info">
          <h1>Simplistic Scientists</h1>
          <div class="genre">Indie Rock / Trip Hop</div>
          <p class="bio">Indie rock and trip hop from the UK. Exploring sound, space, and the metaverse. First artist on Unlimit Music.</p>
        </div>
      </section>
      <section class="tools">
        <div class="section-header"><h2>Tools</h2></div>
        <div class="tools-grid">
          <router-link to="/chords" class="tool-card">
            <div class="tool-name">Unlimit Chords</div>
            <div class="tool-desc">Chords, scales wheel, and songwriting tools.</div>
          </router-link>
          <router-link to="/studio" class="tool-card">
            <div class="tool-name">Unlimit Studio</div>
            <div class="tool-desc">3D world for music collaboration.</div>
          </router-link>
        </div>
      </section>
    </main>
    <footer class="foot">
      <span>© 2026 Unlimit Music</span>
      <span>info@unlimitmusic.com · demos@unlimitmusic.com</span>
    </footer>
  </div>
</template>

<script setup></script>

<style scoped>
.home { height: 100vh; display: flex; flex-direction: column; background: #f8f7f4; color: #1a1a1a; margin: 0; overflow: hidden; font-family: 'Inter', system-ui, sans-serif; }
.topbar { background: #f8f7f4; border-bottom: 1px solid #e5e3df; padding: 1.25rem 2rem; display: flex; align-items: center; justify-content: space-between; }
.logo { font-family: 'Space Mono', monospace; font-size: 1.1rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; text-decoration: none; color: #1a1a1a; }
nav { display: flex; gap: 2rem; align-items: center; }
nav a { font-family: 'Space Mono', monospace; font-size: .75rem; text-transform: uppercase; letter-spacing: .1em; text-decoration: none; color: #8a8a8a; transition: color .2s; }
nav a:hover, nav a.router-link-active { color: #1a1a1a; }
.wrap { flex: 1; padding: 2rem; max-width: 1200px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 2rem; overflow: hidden; }
.artist { display: grid; grid-template-columns: 160px 1fr; gap: 2rem; align-items: start; }
.photo { width: 160px; height: 160px; background: #e8e6e1; }
.photo.placeholder { display: flex; align-items: center; justify-content: center; color: #8a8a8a; font-family: 'Space Mono', monospace; font-size: 2rem; font-weight: 700; }
.info h1 { font-family: 'Space Mono', monospace; font-size: 1.4rem; font-weight: 700; text-transform: uppercase; margin-bottom: .25rem; }
.genre { font-family: 'Space Mono', monospace; font-size: .8rem; color: #8a8a8a; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 1rem; }
.bio { color: #1a1a1a; line-height: 1.7; max-width: 600px; font-size: .95rem; }
.section-header { border-bottom: 1px solid #e5e3df; padding-bottom: .75rem; margin-bottom: 1rem; }
.section-header h2 { font-family: 'Space Mono', monospace; font-size: .85rem; text-transform: uppercase; letter-spacing: .15em; color: #8a8a8a; }
.tools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem; }
.tool-card { text-decoration: none; color: #1a1a1a; padding: 1rem; border: 1px solid #e5e3df; transition: background .2s; }
.tool-card:hover { background: #fff; }
.tool-name { font-family: 'Space Mono', monospace; font-size: .9rem; font-weight: 700; text-transform: uppercase; margin-bottom: .25rem; }
.tool-desc { font-size: .8rem; color: #8a8a8a; }
.foot { border-top: 1px solid #e5e3df; padding: 1.5rem 2rem; display: flex; justify-content: space-between; flex-wrap: wrap; gap: .5rem; font-family: 'Space Mono', monospace; font-size: .7rem; color: #8a8a8a; text-transform: uppercase; letter-spacing: .1em; }
@media (max-width: 700px) { .artist { grid-template-columns: 1fr; } .photo { width: 120px; height: 120px; } }
</style>
