<template>
  <div class="page">
    <header class="topbar">
      <a href="/" class="logo"><img src="/logo.svg" alt="Unlimit Music" class="logoimg" /></a>
      <nav>
        <router-link to="/">Label</router-link>
        <router-link to="/smplstcscntsts" class="active">smplstcscntsts</router-link>
        <router-link to="/chords">Unlimit Chords</router-link>
        <router-link to="/studio">Unlimit Studio</router-link>
      </nav>
    </header>
    <main class="wrap">
      <div class="artist-hero">
        <div class="photo placeholder">SS</div>
        <div class="info">
          <h1>Simplistic Scientists</h1>
          <div class="genre">Indie Rock / Trip Hop</div>
          <div class="bio">
            <p>Exploring the intersection of sound, space, and the metaverse. Creating indie rock and trip hop that pushes boundaries.</p>
            <p>First artist on Unlimit Music.</p>
          </div>
          <div class="socials">
            <a href="#">Bandcamp</a>
            <a href="#">YouTube</a>
            <a href="#">Instagram</a>
            <a href="#">SoundCloud</a>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="section-header"><h2>Explore</h2></div>
        <div class="tools-links">
          <router-link to="/chords">Unlimit Chords →</router-link>
          <router-link to="/studio">Unlimit Studio →</router-link>
        </div>
      </div>
    </main>
    <footer class="foot">
      <span>© 2026 Unlimit Music</span>
      <span>info@unlimitmusic.com · demos@unlimitmusic.com</span>
    </footer>
  </div>
</template>

<script setup></script>

<style scoped>
.page { height: 100vh; display: flex; flex-direction: column; background: #f8f7f4; color: #1a1a1a; margin: 0; overflow: hidden; font-family: 'Inter', system-ui, sans-serif; }
.topbar { background: #f8f7f4; border-bottom: 1px solid #e5e3df; padding: 1.25rem 2rem; display: flex; align-items: center; justify-content: space-between; }
.logo { text-decoration: none; }
.logoimg { height: 20px; }
nav { display: flex; gap: 2rem; align-items: center; }
nav a { font-family: 'Space Mono', monospace; font-size: .75rem; text-transform: uppercase; letter-spacing: .1em; text-decoration: none; color: #8a8a8a; transition: color .2s; }
nav a:hover, nav a.router-link-active { color: #1a1a1a; }
.wrap { flex: 1; padding: 2rem; max-width: 1200px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 1.5rem; overflow: hidden; }
.artist-hero { display: grid; grid-template-columns: 200px 1fr; gap: 2rem; align-items: start; }
.photo { width: 200px; height: 200px; background: #e8e6e1; }
.photo.placeholder { display: flex; align-items: center; justify-content: center; color: #8a8a8a; font-family: 'Space Mono', monospace; font-size: 2rem; font-weight: 700; }
.info h1 { font-family: 'Space Mono', monospace; font-size: clamp(1.6rem, 3vw, 2.4rem); font-weight: 700; text-transform: uppercase; margin-bottom: .5rem; }
.genre { font-family: 'Space Mono', monospace; font-size: .8rem; color: #8a8a8a; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 1rem; }
.bio { font-size: 1rem; line-height: 1.7; max-width: 600px; }
.bio p { margin-bottom: .75rem; }
.socials { display: flex; gap: 1.5rem; margin-top: 1.25rem; }
.socials a { font-family: 'Space Mono', monospace; font-size: .75rem; text-transform: uppercase; letter-spacing: .1em; color: #8a8a8a; text-decoration: none; }
.socials a:hover { color: #1a1a1a; }
.section-header { border-bottom: 1px solid #e5e3df; padding-bottom: .75rem; margin-bottom: 1rem; }
.section-header h2 { font-family: 'Space Mono', monospace; font-size: .85rem; text-transform: uppercase; letter-spacing: .15em; color: #8a8a8a; }
.audio-player { background: #fff; border: 1px solid #e5e3df; padding: 1.25rem; }
.audio-player .track-name { font-family: 'Space Mono', monospace; font-size: .85rem; font-weight: 700; text-transform: uppercase; margin-bottom: .5rem; }
.audio-player audio { width: 100%; }
.tools-links { display: flex; gap: 1.5rem; }
.tools-links a { font-family: 'Space Mono', monospace; font-size: .75rem; text-transform: uppercase; letter-spacing: .1em; color: #8a8a8a; text-decoration: none; }
.tools-links a:hover { color: #1a1a1a; }
.foot { border-top: 1px solid #e5e3df; padding: 1rem 2rem; display: flex; justify-content: space-between; flex-wrap: wrap; gap: .5rem; font-family: 'Space Mono', monospace; font-size: .7rem; color: #8a8a8a; text-transform: uppercase; letter-spacing: .1em; }
@media (max-width: 700px) { .artist-hero { grid-template-columns: 1fr; } .photo { width: 140px; height: 140px; } }
</style>
