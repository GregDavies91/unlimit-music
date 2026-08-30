// Guitar Chords web app — root note -> chords -> audio + diagram.
//
// Audio policy:
//   * ROOT NOTE  -> warm synth jazz tone (no recording exists).
//   * CHORD      -> real mp3 only; one chord plays at a time (choke previous).
// UI:
//   * Left fixed rainbow column of roots (C=red .. B=violet).
//   * Chords colour-coded to their root, strict grid, fits any landscape screen.
//   * Diagram stage is a fixed square; image fades in smoothly (jazz).

(function () {
  "use strict";

  var rootRow = document.getElementById("rootRow");
  var chordRow = document.getElementById("chordRow");
  var diagramImg = document.getElementById("diagramImg");
  var toastEl = document.getElementById("toast");
  var onboardEl = document.getElementById("onboard");
  var onboardOk = document.getElementById("onboardOk");

  function dismissOnboard() {
    if (!onboardEl) return;
    onboardEl.classList.add("hide");
    try { localStorage.setItem("gcf_onboarded", "1"); } catch (e) {}
  }
  if (onboardOk) onboardOk.addEventListener("click", dismissOnboard);
  // also dismiss when the user starts by tapping a root
  if (onboardEl) {
    try { if (localStorage.getItem("gcf_onboarded") === "1") onboardEl.classList.add("hide"); } catch (e) {}
  }

  var toastTimer = null;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  var activeRoot = null;
  var activeChordBtn = null;
  var audioCtx = null;
  var currentChordAudio = null;

  // rainbow: C=red ... B=violet (12 steps around the wheel)
  var ROOT_COLORS = {
    C:  "#ff4d4d", Db: "#ff944d", D: "#ffd24d", Eb: "#c7e64d",
    E:  "#6fe64d", F: "#4de6b0", Gb: "#4dc7e6", G:  "#4d8cff",
    Ab: "#7d4dff", A: "#b04dff", Bb: "#e64dff", B:  "#ff4dc7"
  };

  var SEMI = { A: 0, Bb: 1, B: 2, C: 3, Db: 4, D: 5, Eb: 6, E: 7, F: 8, Gb: 9, G: 10, Ab: 11 };
  function rootFreq(name) {
    var s = SEMI[name]; if (s === undefined) s = 0;
    return 440 * Math.pow(2, (s - 36) / 12); // 3 octaves below A440 (warm, low)
  }
  function ensureCtx() {
    if (!audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  // ---- warm jazz tone for the root note (Rhodes/electric-piano-ish) ----
  function playRootTone(freq, dur) {
    var ctx = ensureCtx();
    if (!ctx) return;
    var now = ctx.currentTime, end = now + dur;
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.5, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    gain.connect(ctx.destination);
    var lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 900; lp.Q.value = 0.4;
    lp.connect(gain);
    var o1 = ctx.createOscillator(); o1.type = "sine"; o1.frequency.value = freq;
    var g1 = ctx.createGain(); g1.gain.value = 1.0; o1.connect(g1); g1.connect(lp);
    var o2 = ctx.createOscillator(); o2.type = "triangle"; o2.frequency.value = freq * 2;
    var g2 = ctx.createGain(); g2.gain.value = 0.18; o2.connect(g2); g2.connect(lp);
    o1.start(now); o2.start(now); o1.stop(end); o2.stop(end);
  }

  // ---- play a real chord recording; choke the previous chord ----
  function playFile(url) {
    if (!url) return;
    if (currentChordAudio && !currentChordAudio.paused) {
      try { currentChordAudio.pause(); currentChordAudio.currentTime = 0; } catch (e) {}
    }
    var a = new Audio(url);
    a.preload = "auto";
    currentChordAudio = a;
    var p = a.play();
    if (p && p.catch) p.catch(function (err) {
      console.warn("chord audio play failed:", url, err && err.message);
    });
  }

  function showDiagram(url) {
    if (!url) {
      diagramImg.classList.remove("show");   // fade out, then blank (no text)
      return;
    }
    diagramImg.src = url;
    // next frame: trigger fade-in (smooth jazz)
    requestAnimationFrame(function () { diagramImg.classList.add("show"); });
  }

  function playChord(rootName, chord) {
    playFile(chord.audio);
    showDiagram(chord.diagram);
  }

  function loadChords(rootName) {
    chordRow.innerHTML = "";
    activeChordBtn = null;
    var color = ROOT_COLORS[rootName] || "#8b93a1";
    var chords = DATA[rootName].chords;
    // military-parade rectangle: fixed COLS, pad the last row with invisible
    // spacers so every row is full (no loose soldiers).
    var COLS = 8;
    chordRow.style.gridTemplateColumns = "repeat(" + COLS + ", 1fr)";
    var total = Math.ceil(chords.length / COLS) * COLS;   // rounded up to full rows

    for (var i = 0; i < total; i++) {
      if (i < chords.length) {
        (function (chord) {
          var btn = document.createElement("button");
          btn.textContent = chord.label;
          btn.style.setProperty("--bc", color);
          btn.addEventListener("click", function () {
            if (activeChordBtn) activeChordBtn.classList.remove("active");
            btn.classList.add("active");
            activeChordBtn = btn;
            playChord(rootName, chord);
          });
          chordRow.appendChild(btn);
        })(chords[i]);
      } else {
        // placeholder button: shows "?", pops a "coming soon" toast
        var sp = document.createElement("button");
        sp.className = "spacer";
        sp.textContent = "?";
        sp.addEventListener("click", function () { showToast("More features coming soon"); });
        chordRow.appendChild(sp);
      }
    }
  }

  function buildRoots() {
    ROOTS.forEach(function (rootName) {
      var btn = document.createElement("button");
      btn.className = "chord-btn root";
      btn.textContent = rootName;
      btn.style.background = ROOT_COLORS[rootName] || "#888";
      btn.addEventListener("click", function () {
        var prev = rootRow.querySelector(".root.active");
        if (prev) prev.classList.remove("active");
        btn.classList.add("active");
        activeRoot = rootName;
        dismissOnboard();                          // first tap hides the hint
        playRootTone(rootFreq(rootName), 1.6);     // root synth (not choked)
        showDiagram(null);                          // blank the stage for now
        diagramImg.classList.remove("show");
        loadChords(rootName);
      });
      rootRow.appendChild(btn);
    });
  }

  buildRoots();
})();
