<template>
  <div class="app">
    <nav class="roots" aria-label="Root notes">
      <div id="rootRow" class="root-col"></div>
    </nav>
    <main class="stage">
      <header class="topbar">
        <a href="/" class="topbtn" style="text-decoration:none;">← Unlimit Music</a>
        <button id="settingsBtn" class="topbtn" aria-haspopup="true">Settings</button>
        <button id="scaleBtn" class="topbtn" aria-haspopup="true">Scale</button>
        <div id="scalePanel" class="panel" role="menu" aria-label="Choose a scale"></div>
        <div id="settingsPanel" class="panel" role="dialog" aria-label="Settings">
          <label class="setting-row">
            <input type="checkbox" id="followChordsToggle" />
            <span>Scales wheel follows the chord root</span>
          </label>
          <p class="setting-note">Off by default. When on, the wheel's top note tracks the root you pick on the left and you can't spin it manually.</p>
          <hr style="border-color: var(--line); margin: .6rem 0;" />
          <a href="../about.html" class="panel-item" style="display:block; text-decoration:none;">About &amp; Contact</a>
          <a href="../privacy.html" class="panel-item" style="display:block; text-decoration:none;">Privacy Policy</a>
        </div>
      </header>
      <div class="stage-mid">
        <section class="diagrams">
          <div class="diagram-box" aria-label="Chord diagram">
            <div class="diagram-stage">
              <img id="diagramImg" alt="Guitar chord diagram" />
            </div>
          </div>
          <div class="piano-slot" aria-hidden="true"></div>
        </section>
        <section class="scales-box" aria-label="Scales wheel">
          <div id="scalesWheel" class="scales-wheel"></div>
          <div id="scalesCaption" class="scales-caption">Chromatic</div>
        </section>
      </div>
      <section class="chords" aria-label="Chords in this key">
        <div id="chordRow" class="chord-grid"></div>
      </section>
    </main>
  </div>
  <div id="toast" class="toast" role="status" aria-live="polite"></div>
</template>

<script setup>
import { onMounted } from 'vue'
import { ROOTS, DATA } from '../data.js'
import '../scales.js'

onMounted(() => {
  // ported from chords/app.js
  const rootRow = document.getElementById('rootRow')
  const chordRow = document.getElementById('chordRow')
  const diagramImg = document.getElementById('diagramImg')
  const toastEl = document.getElementById('toast')

  const ROOT_COLORS = {
    C: '#ff4d4d', Db: '#ff944d', D: '#ffd24d', Eb: '#c7e64d',
    E: '#6fe64d', F: '#4de6b0', Gb: '#4dc7e6', G: '#4d8cff',
    Ab: '#7d4dff', A: '#b04dff', Bb: '#e64dff', B: '#ff4dc7'
  }
  const SEMI = { C: 3, Db: 4, D: 5, Eb: 6, E: 7, F: 8, Gb: 9, G: 10, Ab: 11, A: 12, Bb: 13, B: 14 }
  function rootFreq(name) { const s = SEMI[name] ?? 0; return 440 * Math.pow(2, (s - 36) / 12) }
  let audioCtx = null
  function ensureCtx() {
    if (!audioCtx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) audioCtx = new AC() }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume()
    return audioCtx
  }
  function playRootTone(freq, dur) {
    const ctx = ensureCtx(); if (!ctx) return
    const now = ctx.currentTime, end = now + dur
    const gain = ctx.createGain(); gain.gain.setValueAtTime(0.0001, now); gain.gain.exponentialRampToValueAtTime(0.5, now + 0.04); gain.gain.exponentialRampToValueAtTime(0.0001, end); gain.connect(ctx.destination)
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 0.4; lp.connect(gain)
    const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = freq
    const g1 = ctx.createGain(); g1.gain.value = 1.0; o1.connect(g1); g1.connect(lp)
    const o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.value = freq * 2
    const g2 = ctx.createGain(); g2.gain.value = 0.18; o2.connect(g2); g2.connect(lp)
    o1.start(now); o2.start(now); o1.stop(end); o2.stop(end)
  }
  let currentChordAudio = null
  function playFile(url) {
    if (!url) return
    if (currentChordAudio && !currentChordAudio.paused) { try { currentChordAudio.pause(); currentChordAudio.currentTime = 0 } catch (e) {} }
    const a = new Audio(url); a.preload = 'auto'; currentChordAudio = a
    const p = a.play(); if (p && p.catch) p.catch(err => console.warn('chord audio play failed:', url, err && err.message))
  }
  function showDiagram(url) {
    if (!url) { diagramImg.classList.remove('show'); return }
    diagramImg.src = url
    requestAnimationFrame(() => diagramImg.classList.add('show'))
  }
  function playChord(rootName, chord) { playFile(chord.audio); showDiagram(chord.diagram) }

  function loadChords(rootName) {
    chordRow.innerHTML = ''
    const color = ROOT_COLORS[rootName] || '#8b93a1'
    const chords = DATA[rootName].chords
    const COLS = 8
    chordRow.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`
    const total = Math.ceil(chords.length / COLS) * COLS
    for (let i = 0; i < total; i++) {
      if (i < chords.length) {
        const chord = chords[i]
        const btn = document.createElement('button')
        btn.textContent = chord.label
        btn.style.setProperty('--bc', color)
        btn.addEventListener('click', () => {
          chordRow.querySelectorAll('button.active').forEach(b => b.classList.remove('active'))
          btn.classList.add('active')
          playChord(rootName, chord)
        })
        chordRow.appendChild(btn)
      } else {
        const sp = document.createElement('button')
        sp.className = 'spacer'; sp.textContent = '?'
        chordRow.appendChild(sp)
      }
    }
  }

  function buildRoots() {
    ROOTS.forEach(rootName => {
      const btn = document.createElement('button')
      btn.className = 'chord-btn root'
      btn.textContent = rootName
      btn.style.background = ROOT_COLORS[rootName] || '#888'
      btn.addEventListener('click', () => {
        rootRow.querySelectorAll('.root.active').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        if (window.ScalesWheel) window.ScalesWheel.onRootSelected(rootName)
        playRootTone(rootFreq(rootName), 1.6)
        showDiagram(null); diagramImg.classList.remove('show')
        loadChords(rootName)
      })
      rootRow.appendChild(btn)
    })
  }
  buildRoots()
})
</script>

<style scoped>
/* minimal; reuse global style.css from chords if copied */
</style>
