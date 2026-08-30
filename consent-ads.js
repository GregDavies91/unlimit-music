// Consent-gated ads (UK GDPR / PECR).
// AdSense script is injected ONLY after an explicit Accept click.
// Reject => no ad script ever loads.
// Set SITE_CONFIG.ADSENSE_PUB_ID (and optionally ADSENSE_AD_SLOT) in config.js.
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};
  var PUB = cfg.ADSENSE_PUB_ID || "ca-pub-REPLACE_WITH_YOUR_ID";
  var SLOT = cfg.ADSENSE_AD_SLOT || "REPLACE_WITH_AD_UNIT_SLOT";
  var slot = document.getElementById("ad-slot");
  var consentEl = document.getElementById("consent");
  var KEY = "um_consent";

  function loadAds() {
    if (!slot) return;
    if (PUB.indexOf("REPLACE") !== -1) {
      // Not configured yet -> keep the slot silently empty (no placeholder text).
      slot.innerHTML = '';
      return;
    }

    // 1) Load the AdSense loader (only after consent).
    var s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(PUB);
    document.head.appendChild(s);

    // 2) If a specific ad unit slot is configured, render it into the slot.
    //    Otherwise fall back to Auto Ads (Google places ads automatically).
    if (SLOT.indexOf("REPLACE") === -1) {
      slot.innerHTML =
        '<ins class="adsbygoogle" style="display:block" data-ad-client="' + PUB +
        '" data-ad-slot="' + SLOT +
        '" data-ad-format="auto" data-full-width-responsive="true"></ins>';
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
    // Auto Ads: no <ins> needed — once the script loads, Google injects ads.
  }

  function accept() {
    try { localStorage.setItem(KEY, "1"); } catch (e) {}
    if (consentEl) consentEl.classList.add("hide");
    loadAds();
  }
  function reject() {
    try { localStorage.setItem(KEY, "0"); } catch (e) {}
    if (consentEl) consentEl.classList.add("hide");
  }

  var acc = document.getElementById("consentAccept");
  var rej = document.getElementById("consentReject");
  if (acc) acc.addEventListener("click", accept);
  if (rej) rej.addEventListener("click", reject);

  // Honour a previous decision (don't re-prompt).
  var decided = null;
  try { decided = localStorage.getItem(KEY); } catch (e) {}
  if (decided === "1") { if (consentEl) consentEl.classList.add("hide"); loadAds(); }
  else if (decided === "0") { if (consentEl) consentEl.classList.add("hide"); }
})();
