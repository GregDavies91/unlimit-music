// Scales wheel — a melody instrument by Ian "Ron" Davies.
//
// Design (locked with Greg):
//  * 12 chromatic orbs in a circle, coloured like the left root column.
//  * Top orb = tonic (lowest pitch). Moving clockwise = up a semitone.
//    Pitch is fixed per POSITION, not per note name: rotating the wheel
//    only moves which note sits at the top; it never re-pitches a note.
//  * Polyphonic, no choking. Each press is its own synth voice.
//  * A press plays a warm pluck (one-shot, decays). Orb lights while held;
//    note name shows in the wheel centre while held.
//  * Default = Chromatic (all 12 active). Picking a scale darkens the rest
//    (still visible, but unpressable).
//  * Drag OUTSIDE the orbs = spin the wheel; release snaps to nearest key
//    (medium inertia, tunable below). Drag STARTING on an orb = play mode:
//    even if the finger slips into the centre or off the wheel, it keeps
//    playing notes (glissando) and does NOT rotate until released.
//  * Octave sweep: the next note picks the octave nearest the last played
//    pitch, so sweeping up keeps climbing, down keeps descending, and it
//    wraps smoothly through octaves (no "Ab drops to a low A" jump).
//  * Follow-chords (Settings): when ON, the tonic tracks the left-column
//    root and manual rotation is locked. OFF by default.
//  * Mobile multi-touch works: each touch is its own pointerId.

(function () {
  "use strict";

  // ---- tunables (us, not the user) ----
  var INERTIA_DECAY   = 0.93;   // per ~16ms frame; lower = stops sooner
  var INERTIA_MAXVEL  = 0.020;  // rad/ms cap on flick velocity
  var INERTIA_START   = 0.0007; // above this on release -> glide then snap
  var SNAP_MS         = 160;    // snap-to-detent tween length

  var ROOT_COLORS = {
    C:"#ff4d4d", Db:"#ff944d", D:"#ffd24d", Eb:"#c7e64d",
    E:"#6fe64d", F:"#4de6b0", Gb:"#4dc7e6", G:"#4d8cff",
    Ab:"#7d4dff", A:"#b04dff", Bb:"#e64dff", B:"#ff4dc7"
  };
  // Pitch classes: C=0 .. B=11. A=9 so A4=440 (midi 69) stays true.
  var SEMI = { C:0, Db:1, D:2, Eb:3, E:4, F:5, Gb:6, G:7, Ab:8, A:9, Bb:10, B:11 };
  var CHROMA = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];

  function intervalsToMask(iv) {
    var m = new Array(12).fill(0);
    iv.forEach(function (i) { m[((i % 12) + 12) % 12] = 1; });
    return m;
  }
  // scale name -> 12-length mask (1 = in scale)
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
  // warm guitar-ish pluck: triangle + sine, lowpass, fast attack, decay
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
  // pick the octave of `base` nearest to `last` (smooth sweep, no jump)
  function pickOctave(base, last) {
    if (last === null) return base;
    var cands = [base - 12, base, base + 12], best = cands[0], bd = Math.abs(cands[0] - last);
    for (var i = 1; i < 3; i++) {
      var d = Math.abs(cands[i] - last);
      if (d < bd) { bd = d; best = cands[i]; }
    }
    return best;
  }

  // ---- state ----
  var state = {
    tonic: 0,            // CHROMA index at the top position
    rotation: 0,         // radians applied to the ring
    scaleName: "Chromatic",
    followChords: false,
    dragging: false,
    mode: null,          // "play" | "rotate"
    lastAngle: 0,
    velocity: 0,
    lastMoveTime: 0,
    held: {},            // pointerId -> position(0..11)
    orbActive: new Array(12).fill(true),
    lastPitch: null,     // last midi played (for octave sweep)
    orbEls: [],
    ringEl: null
  };

  var wheelEl, centerEl;

  // ---- build ----
  function buildWheel() {
    wheelEl = document.getElementById("scalesWheel");
    if (!wheelEl) return;
    wheelEl.innerHTML = "";
    var ring = document.createElement("div");
    ring.className = "scales-ring";
    state.ringEl = ring;
    state.orbEls = [];
    for (var i = 0; i < 12; i++) {
      var orb = document.createElement("button");
      orb.className = "scales-orb";
      orb.type = "button";
      orb.dataset.pos = i;
      orb.textContent = CHROMA[i];
      orb.style.setProperty("--orb", ROOT_COLORS[CHROMA[i]]);
      ring.appendChild(orb);
      state.orbEls.push(orb);
    }
    wheelEl.appendChild(ring);
    centerEl = document.createElement("div");
    centerEl.className = "scales-center";
    centerEl.id = "scalesCenter";
    wheelEl.appendChild(centerEl);

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
    var orbSize = Math.max(26, Math.min(40, minDim * 0.13));
    var radius = minDim / 2 - orbSize / 2 - 4;
    state.orbEls.forEach(function (orb, i) {
      var ang = (i / 12) * 2 * Math.PI - Math.PI / 2; // i=0 at top
      var x = Math.cos(ang) * radius, y = Math.sin(ang) * radius;
      orb.style.width = orb.style.height = orbSize + "px";
      orb.style.left = "50%";
      orb.style.top = "50%";
      orb.style.transform = "translate(-50%,-50%) translate(" + x + "px," + y + "px)";
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
    if (state.ringEl) state.ringEl.style.transform = "rotate(" + state.rotation + "rad)";
  }
  function setCenter(txt) { if (centerEl) centerEl.textContent = txt || ""; }

  // ---- playing ----
  function playOrb(pos, pointerId) {
    if (!state.orbActive[pos]) return;
    var note = CHROMA[pos];
    var baseMidi = 60 + SEMI[note];
    var midi = pickOctave(baseMidi, state.lastPitch);
    state.lastPitch = midi;
    playPluck(midiToFreq(midi));
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
      state.lastPitch = null;
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
    delta = Math.atan2(Math.sin(delta), Math.cos(delta)); // shortest path
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
    if (!state.dragging) return;
    var now = performance.now();
    var dt = Math.max(8, now - state.lastMoveTime);
    state.lastMoveTime = now;
    state.rotation += state.velocity * dt;
    state.velocity *= INERTIA_DECAY;
    renderRotation();
    if (Math.abs(state.velocity) > 0.0006) requestAnimationFrame(inertia);
    else { state.dragging = false; snapTween(nearestDetentRot()); }
  }

  // ---- pointer handling (mouse + touch + pen) ----
  function onDown(e) {
    if (!wheelEl) return;
    ensureCtx();
    var orb = e.target.closest ? e.target.closest(".scales-orb") : null;
    if (orb) {
      state.mode = "play";
      playOrb(+orb.dataset.pos, e.pointerId);
    } else {
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
      var orb = el && el.closest ? el.closest(".scales-orb") : null;
      if (orb) {
        var pos = +orb.dataset.pos;
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
        state.dragging = false;
        if (Math.abs(state.velocity) > INERTIA_START) requestAnimationFrame(inertia);
        else snapTween(nearestDetentRot());
      }
    }
    state.mode = null;
    e.preventDefault();
  }

  // ---- public API (used by app.js for follow-chords) ----
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
    computeOrbActive();
    renderWheel();
  }
  function setFollow(on) {
    state.followChords = !!on;
    if (on) {
      // lock to current tonic immediately
      state.rotation = -(state.tonic / 12) * 2 * Math.PI;
      renderRotation();
    }
  }

  window.ScalesWheel = {
    setScale: setScale,
    onRootSelected: onRootSelected,
    setFollow: setFollow
  };

  // ---- panels (Scale picker + Settings) ----
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
    // click outside closes panels
    document.addEventListener("click", function (e) {
      if (scalePanel && !scalePanel.contains(e.target) && e.target !== scaleBtn) scalePanel.classList.remove("open");
      if (settingsPanel && !settingsPanel.contains(e.target) && e.target !== settingsBtn) settingsPanel.classList.remove("open");
    });
    if (follow) follow.addEventListener("change", function () {
      setFollow(follow.checked);
    });
    buildScalePanel();
  }

  // ---- attach pointer interaction to the wheel ----
  function wireWheel() {
    if (!wheelEl) return;
    wheelEl.addEventListener("pointerdown", onDown);
    // move/up are on window so a drag slipped off the wheel still tracks
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
