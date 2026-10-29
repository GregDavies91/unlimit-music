<template>
  <div class="band">
    <header class="topbar">
      <div class="brand">
        <img src="/favicon.svg" alt="Unlimit Music" class="logo" />
        <span class="name">UNLIMIT MUSIC</span>
      </div>
      <nav>
        <router-link to="/">Label</router-link>
        <router-link to="/smplstcscntsts">smplstcscntsts</router-link>
        <router-link to="/chords">Chords</router-link>
        <router-link to="/studio">Studio</router-link>
      </nav>
    </header>
    <main class="hero">
      <div class="artist">
        <div class="photo placeholder">SS</div>
        <div class="info">
          <h1>smplstcscntsts</h1>
          <div class="genre">Ambient / Electronic / Experimental</div>
          <p class="bio">Simplistic Scientists — exploring the intersection of sound, space, and the metaverse. Creating ambient, electronic, and experimental music that pushes boundaries. First artist on Unlimit Music.</p>
          <div class="links">
            <a href="https://bandcamp.com" target="_blank" rel="noopener">Bandcamp</a>
            <a href="https://youtube.com" target="_blank" rel="noopener">YouTube</a>
            <a href="https://instagram.com" target="_blank" rel="noopener">Instagram</a>
            <a href="https://soundcloud.com" target="_blank" rel="noopener">SoundCloud</a>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup></script>

<style scoped>
.band { height: 100vh; display: flex; flex-direction: column; }
.topbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; border-bottom: 1px solid #e5e3df; }
.brand { display: flex; align-items: center; gap: .75rem; }
.logo { width: 28px; height: 28px; }
.name { font-family: monospace; font-weight: 700; letter-spacing: .05em; }
nav { display: flex; gap: 1.5rem; }
nav a { text-decoration: none; color: #8a8a8a; font-size: .8rem; text-transform: uppercase; letter-spacing: .1em; }
nav a.router-link-active { color: #1a1a1a; }
.hero { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; }
.artist { display: grid; grid-template-columns: 220px 1fr; gap: 2rem; max-width: 900px; width: 100%; align-items: center; }
.photo { width: 220px; height: 220px; object-fit: cover; border-radius: 2px; }
.info h1 { font-family: monospace; font-size: 2rem; text-transform: uppercase; margin-bottom: .25rem; }
.genre { font-family: monospace; font-size: .75rem; color: #8a8a8a; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 1rem; }
.bio { color: #444; line-height: 1.6; max-width: 520px; margin-bottom: 1.25rem; }
.links { display: flex; gap: 1.25rem; flex-wrap: wrap; }
.links a { font-family: monospace; font-size: .75rem; text-transform: uppercase; letter-spacing: .1em; color: #8a8a8a; text-decoration: none; }
.links a:hover { color: #1a1a1a; }
@media (max-width: 700px) { .artist { grid-template-columns: 1fr; } .photo { width: 160px; height: 160px; } }
</style>
