// Scales wheel — a melody instrument by Ian "Ron" Davies.
// (Rewritten cleanly 2026-09-05: ring is now a visible draggable border
//  OUTSIDE the orbs, no arrows, orb clicks play notes and don't start drags.)
(function () {
  "use strict";

  var INERTIA_DECAY   = 0.93;
  var INERTIA_MAXVEL  = 0.020;
  var INERTIA_START   = 0.0007;
  var SNAP_MS         = 160;

  var ROOT_COLORS = {
    C:"#ff4d4d", Db:"#ff944d", D:"#ffd24d", Eb:"#c7e64d",
    E:"#6fe64d", F:"#4de6b0", Gb:"#4dc7e6", G:"#4d8cff",
    Ab:"#7d4dff", A:"#b04dff", Bb:"#e64dff", B:"#ff4dc7"
  };
  var SEMI = { C:0, Db:1, D:2, Eb:3, E:4, F:5, Gb:6, G:7, Ab:8, A:9, Bb:10, B:11 };
  var CHROMA = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];

  function intervalsToMask(iv) {
    var m = new Array(12).fill(0);
    iv.forEach(function (i) { m[((i % 12) + 12) % 12] = 1; });
    return m;
  }
  var SCALES = {
    "Chromatic":        intervalsToMask([0,1,2,3,4,5,6,7,8,9,10,11]),
    "Major":            intervalsToMask([0,2,4,5,7,9,11]),
    "Natural Minor":    intervalsToMask([0,2,3,5,7,8,10]),
    "Major Pentatonic": intervalsToMask([0,2,4,7,9]),
    "Minor Pentatonic": intervalsToMask([0,3,5,7,10]),
    "Blues":            intervalsToMask([0,3,5,6,7,10]),
    "Dorian":           intervalsToMask([0,2,3,5,7,9,10]),
    "Mixolydian":       intervalsToMask([0,2,4,5,7,9,10]),
    "Harmonic Minor":   intervalsToMask([0,2,3,5,7,8,11]),
    "Melodic Minor":    intervalsToMask([0,2,3,5,7,9,11]),
    "Phrygian":         intervalsToMask([0,1,3,5,7,8,10]),
    "Lydian":           intervalsToMask([0,2,4,6,7,9,11]),
    "Locrian":          intervalsToMask([0,1,3,5,6,8,10]),
    "Whole Tone":       intervalsToMask([0,2,4,6,8,10])
  };

  // ---- audio ----
  var audioCtx = null;
  function ensureCtx() {
    if (!audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }
  function playPluck(freq) {
    var ctx = ensureCtx();
    if (!ctx) return;
    var now = ctx.currentTime, dur = 1.6;
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.30, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    gain.connect(ctx.destination);
    var lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 2200; lp.Q.value = 0.6;
    lp.connect(gain);
    var o1 = ctx.createOscillator(); o1.type = "triangle"; o1.frequency.value = freq;
    o1.connect(lp);
    var o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = freq * 2;
    var g2 = ctx.createGain(); g2.gain.value = 0.35; o2.connect(g2); g2.connect(lp);
    o1.start(now); o2.start(now);
    o1.stop(now + dur); o2.stop(now + dur);
  }
  function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function pickOctave(base, last) {
    if (last === null) return base;
    var cands = [base - 36, base - 24, base - 12, base, base + 12, base + 24, base + 36];
    if (state.pitchDir > 0) {
      // Climbing: pick the lowest candidate strictly above last
      var best = null;
      for (var i = 0; i < cands.length; i++) {
        if (cands[i] > last && (best === null || cands[i] < best)) best = cands[i];
      }
      return best !== null ? best : base + 12;
    } else if (state.pitchDir < 0) {
      // Descending: pick the highest candidate strictly below last
      var best = null;
      for (var i = 0; i < cands.length; i++) {
        if (cands[i] < last && (best === null || cands[i] > best)) best = cands[i];
      }
      return best !== null ? best : base - 12;
    }
    // No direction (same note repeated): keep the same octave as last time
    var best = cands[0], bd = Math.abs(cands[0] - last);
    for (var i = 1; i < cands.length; i++) {
      var d = Math.abs(cands[i] - last);
      if (d < bd) { bd = d; best = cands[i]; }
    }
    return best;
  }

  // ---- state ----
  var state = {
    tonic: 0,
    rotation: 0,
    scaleName: "Chromatic",
    followChords: false,
    dragging: false,
    mode: null,
    lastAngle: 0,
    velocity: 0,
    lastMoveTime: 0,
    held: {},
    orbActive: new Array(12).fill(true),
    lastPitch: null,
    // Track the last two semitone positions to detect pitch direction
    // (up/down) for octave stepping when tapping.
    lastSemitone: null,
    pitchDir: 0,           // +1 = climbing, -1 = descending, 0 = unknown
    orbEls: [],
    ringEl: null
  };

  var wheelEl, centerEl, ringEl;

  // ---- build ----
  function buildWheel() {
    wheelEl = document.getElementById("scalesWheel");
    if (!wheelEl) return;
    wheelEl.innerHTML = "";

    // The RING: a visible circular border OUTSIDE the orbs. This is the drag
    // surface. Orbs live INSIDE the ring (above it in z-order) so clicking an
    // orb still plays a note.
    ringEl = document.createElement("div");
    ringEl.className = "scales-ring";
    wheelEl.appendChild(ringEl);

    // Center: shows the currently held/note name. A direct child of wheelEl
    // (NOT the ring) so it never rotates — always stays upright.
    centerEl = document.createElement("div");
    centerEl.className = "scales-center";
    centerEl.id = "scalesCenter";
    wheelEl.appendChild(centerEl);

    // Orbs INSIDE the ring, with their own pointer events.
    state.orbEls = [];
    for (var i = 0; i < 12; i++) {
      var orb = document.createElement("button");
      orb.className = "scales-orb";
      orb.type = "button";
      orb.dataset.pos = i;
      orb.textContent = CHROMA[i];
      orb.style.setProperty("--orb", ROOT_COLORS[CHROMA[i]]);
      ringEl.appendChild(orb);
      state.orbEls.push(orb);
    }

    layoutWheel();
    computeOrbActive();
    renderWheel();
    renderRotation();

    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(layoutWheel).observe(wheelEl);
    }
  }

  function layoutWheel() {
    if (!wheelEl || !state.orbEls.length) return;
    var w = wheelEl.clientWidth, h = wheelEl.clientHeight;
    if (!w || !h) return;
    var minDim = Math.min(w, h);
    // Orbs cluster in the centre; the wide band between them and the outer
    // ring edge is the draggable surface.
    var orbSize = Math.max(26, Math.min(36, minDim * 0.10));
    var radius = minDim * 0.30; // orb ring at 30% of wheel radius leaves a wide outer drag band
    state.orbEls.forEach(function (orb, i) {
      var ang = (i / 12) * 2 * Math.PI - Math.PI / 2;
      var x = Math.cos(ang) * radius, y = Math.sin(ang) * radius;
      orb.style.width = orb.style.height = orbSize + "px";
      orb.style.left = "50%";
      orb.style.top = "50%";
      orb.style.transform = "translate(-50%,-50%) translate(" + x + "px," + y + "px)";
      orb._base = orb.style.transform;
    });
  }

  function computeOrbActive() {
    var mask = SCALES[state.scaleName];
    var tSemi = SEMI[CHROMA[state.tonic]];
    state.orbActive = [];
    for (var i = 0; i < 12; i++) {
      var interval = ((SEMI[CHROMA[i]] - tSemi) % 12 + 12) % 12;
      state.orbActive.push(mask[interval] === 1);
    }
  }

  function renderWheel() {
    state.orbEls.forEach(function (orb, i) {
      orb.classList.toggle("inactive", !state.orbActive[i]);
    });
  }
  function renderRotation() {
    if (ringEl) ringEl.style.transform = "rotate(" + state.rotation + "rad)";
    state.orbEls.forEach(function (orb) {
      orb.style.transform = (orb._base || "") + " rotate(" + (-state.rotation) + "rad)";
    });
  }

  var centerFadeTimer = null;
  var centerFadeRAF = null;
  function setCenter(txt) {
    if (!centerEl) return;
    if (txt) {
      // New note: cancel any fade, show instantly at full brightness
      if (centerFadeTimer) { clearTimeout(centerFadeTimer); centerFadeTimer = null; }
      if (centerFadeRAF) { cancelAnimationFrame(centerFadeRAF); centerFadeRAF = null; }
      centerEl.textContent = txt;
      centerEl.style.opacity = "1";
    } else {
      // Start fade sequence: wait 3s, then fade out over 1.2s
      if (centerFadeTimer) clearTimeout(centerFadeTimer);
      centerFadeTimer = setTimeout(function () {
        var start = performance.now();
        var dur = 1200;
        function step(now) {
          var k = Math.min(1, (now - start) / dur);
          centerEl.style.opacity = String(1 - k);
          if (k < 1) centerFadeRAF = requestAnimationFrame(step);
          else { centerEl.style.opacity = "0"; centerFadeRAF = null; }
        }
        centerFadeRAF = requestAnimationFrame(step);
        centerFadeTimer = null;
      }, 3000);
    }
  }

  // ---- playing (orb click = note) ----
  function playOrb(pos, pointerId) {
    if (!state.orbActive[pos]) return;
    var note = CHROMA[pos];
    var baseMidi = 60 + SEMI[note];
    var semitone = SEMI[note];
    // Detect direction from the last two taps so octave stepping works
    // when tapping (not just glissando).
    var prevSemitone = state.lastSemitone;
    if (state.lastSemitone !== null) {
      var diff = semitone - state.lastSemitone;
      // Wrap-around: C(0) after B(11) = climbing, B(11) after C(0) = descending
      if (diff > 6) diff -= 12;
      else if (diff < -6) diff += 12;
      if (diff !== 0) state.pitchDir = diff > 0 ? 1 : -1;
    }
    state.lastSemitone = semitone;
    var midi;
    if (prevSemitone !== null && semitone === prevSemitone && state.lastPitch !== null) {
      // Same note repeated: reuse the exact same midi pitch so it doesn't
      // shift octave on repeated taps.
      midi = state.lastPitch;
    } else {
      midi = pickOctave(baseMidi, state.lastPitch);
    }
    state.lastPitch = midi;
    playPluck(midiToFreq(midi));
    // Glissando: remove lit from the previous orb for this pointer so the
    // light doesn't linger — only the currently touched orb is lit.
    var prevPos = state.held[pointerId];
    if (prevPos !== undefined && prevPos !== pos) {
      var stillHeld = false;
      for (var k in state.held) { if (k !== String(pointerId) && state.held[k] === prevPos) { stillHeld = true; break; } }
      if (!stillHeld) state.orbEls[prevPos].classList.remove("lit");
    }
    state.held[pointerId] = pos;
    state.orbEls[pos].classList.add("lit");
    setCenter(note);
  }
  function stopOrb(pointerId) {
    var pos = state.held[pointerId];
    if (pos !== undefined) {
      delete state.held[pointerId];
      var still = false;
      for (var k in state.held) { if (state.held[k] === pos) { still = true; break; } }
      if (!still) state.orbEls[pos].classList.remove("lit");
    }
    if (Object.keys(state.held).length === 0) {
      // Don't reset lastPitch/lastSemitone — keep them persistent so the
      // next tap can continue the octave stepping from where we left off
      // (same continuity as glissando, just with the finger lifted).
      // Fade the centre letter out gradually after the last note releases
      setCenter("");
    }
  }

  // ---- rotation / snap ----
  function angleOf(e) {
    var r = wheelEl.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    return Math.atan2(e.clientY - cy, e.clientX - cx);
  }
  function computeTonic() {
    var turns = -state.rotation / (2 * Math.PI);
    return ((Math.round(turns * 12) % 12) + 12) % 12;
  }
  function nearestDetentRot() {
    var pos = computeTonic();
    return -(pos / 12) * 2 * Math.PI;
  }
  function snapTween(target) {
    var start = state.rotation;
    var delta = target - start;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));
    var t0 = performance.now();
    function step(now) {
      var k = Math.min(1, (now - t0) / SNAP_MS);
      var e = 1 - Math.pow(1 - k, 3);
      state.rotation = start + delta * e;
      renderRotation();
      if (k < 1) requestAnimationFrame(step);
      else {
        state.rotation = start + delta;
        state.tonic = computeTonic();
        computeOrbActive();
        renderWheel();
      }
    }
    requestAnimationFrame(step);
  }
  function inertia() {
    var now = performance.now();
    var dt = Math.max(8, now - state.lastMoveTime);
    state.lastMoveTime = now;
    state.rotation += state.velocity * dt;
    state.velocity *= INERTIA_DECAY;
    renderRotation();
    if (Math.abs(state.velocity) > 0.0006) requestAnimationFrame(inertia);
    else { state.dragging = false; snapTween(nearestDetentRot()); }
  }

  // ---- pointer handling ----
  function onDown(e) {
    if (!wheelEl) return;
    ensureCtx();
    var orb = e.target.closest ? e.target.closest(".scales-orb") : null;
    if (orb) {
      // Clicked an orb -> play that note, NOT rotate.
      state.mode = "play";
      playOrb(+orb.dataset.pos, e.pointerId);
    } else {
      // Clicked the ring (or anywhere else on the wheel) -> drag to rotate.
      state.mode = "rotate";
      if (!state.followChords) {
        state.dragging = true;
        state.lastAngle = angleOf(e);
        state.velocity = 0;
        state.lastMoveTime = performance.now();
      }
    }
    e.preventDefault();
  }
  function onMove(e) {
    if (state.mode === "play") {
      var el = document.elementFromPoint(e.clientX, e.clientY);
      var o = el && el.closest ? el.closest(".scales-orb") : null;
      if (o) {
        var pos = +o.dataset.pos;
        if (state.held[e.pointerId] !== pos) playOrb(pos, e.pointerId);
      }
    } else if (state.mode === "rotate" && state.dragging && !state.followChords) {
      var ang = angleOf(e);
      var delta = ang - state.lastAngle;
      delta = Math.atan2(Math.sin(delta), Math.cos(delta));
      state.rotation += delta;
      state.lastAngle = ang;
      var now = performance.now();
      var dt = now - state.lastMoveTime;
      if (dt > 0) state.velocity = delta / dt;
      if (state.velocity > INERTIA_MAXVEL) state.velocity = INERTIA_MAXVEL;
      if (state.velocity < -INERTIA_MAXVEL) state.velocity = -INERTIA_MAXVEL;
      state.lastMoveTime = now;
      renderRotation();
      
    }
    e.preventDefault();
  }
  function onUp(e) {
    if (state.mode === "play") {
      stopOrb(e.pointerId);
    } else if (state.mode === "rotate") {
      if (state.dragging) {
        // Don't set dragging=false here — inertia() needs it true to run.
        // inertia() will set it false when it finishes.
        if (Math.abs(state.velocity) > INERTIA_START) requestAnimationFrame(inertia);
        else snapTween(nearestDetentRot());
      }
    }
    state.mode = null;
    e.preventDefault();
  }

  // ---- public API ----
  function setScale(name) {
    if (!SCALES[name]) return;
    state.scaleName = name;
    computeOrbActive();
    renderWheel();
    var cap = document.getElementById("scalesCaption");
    if (cap) cap.textContent = name;
  }
  function onRootSelected(name) {
    if (!state.followChords) return;
    var idx = CHROMA.indexOf(name);
    if (idx < 0) return;
    state.tonic = idx;
    state.rotation = -(idx / 12) * 2 * Math.PI;
    renderRotation();
    // Reset pitch tracking so octave stepping starts fresh from the new root
    // (otherwise the new key's root would jump at the old C-based pitch).
    state.lastPitch = null;
    state.lastSemitone = null;
    state.pitchDir = 0;
    computeOrbActive();
    renderWheel();
  }
  function setFollow(on) {
    state.followChords = !!on;
    if (on) {
      state.rotation = -(state.tonic / 12) * 2 * Math.PI;
      renderRotation();
      
    }
  }

  window.ScalesWheel = {
    setScale: setScale,
    onRootSelected: onRootSelected,
    setFollow: setFollow
  };

  // ---- panels ----
  function buildScalePanel() {
    var panel = document.getElementById("scalePanel");
    if (!panel) return;
    var list = document.createElement("div");
    list.className = "panel-list";
    Object.keys(SCALES).forEach(function (name) {
      var b = document.createElement("button");
      b.className = "panel-item";
      b.textContent = name;
      b.addEventListener("click", function () {
        setScale(name);
        panel.classList.remove("open");
      });
      list.appendChild(b);
    });
    panel.appendChild(list);
  }
  function wireUI() {
    var scaleBtn = document.getElementById("scaleBtn");
    var settingsBtn = document.getElementById("settingsBtn");
    var scalePanel = document.getElementById("scalePanel");
    var settingsPanel = document.getElementById("settingsPanel");
    var follow = document.getElementById("followChordsToggle");
    if (scaleBtn && scalePanel) scaleBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      settingsPanel && settingsPanel.classList.remove("open");
      scalePanel.classList.toggle("open");
    });
    if (settingsBtn && settingsPanel) settingsBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      scalePanel && scalePanel.classList.remove("open");
      settingsPanel.classList.toggle("open");
    });
    document.addEventListener("click", function (e) {
      if (scalePanel && !scalePanel.contains(e.target) && e.target !== scaleBtn) scalePanel.classList.remove("open");
      if (settingsPanel && !settingsPanel.contains(e.target) && e.target !== settingsBtn) settingsPanel.classList.remove("open");
    });
    if (follow) follow.addEventListener("change", function () { setFollow(follow.checked); });
    buildScalePanel();
  }

  // ---- wire wheel pointer events ----
  function wireWheel() {
    if (!wheelEl) return;
    wheelEl.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  // ---- init ----
  function init() {
    buildWheel();
    wireWheel();
    wireUI();
    setScale("Chromatic");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
