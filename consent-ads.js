// Ad rendering — consent is now handled by Google's CERTIFIED CMP (Funding Choices)
// plus Consent Mode v2 (see the inline scripts in index.html). No homemade
// consent gate here: the CMP sets the consent signal, AdSense respects it.
// This file only renders the ad unit once AdSense is approved.
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};
  var PUB = cfg.ADSENSE_PUB_ID || "ca-pub-1921965753258324";
  var SLOT = cfg.ADSENSE_AD_SLOT || "REPLACE_WITH_AD_UNIT_SLOT";
  var slot = document.getElementById("ad-slot");

  if (!slot) return;
  if (PUB.indexOf("REPLACE") !== -1 || SLOT.indexOf("REPLACE") === -1) {
    // Only render a manual unit if a real SLOT is configured.
    // Otherwise fall back to Auto Ads (Google injects ads itself after consent).
    return;
  }

  slot.innerHTML =
    '<ins class="adsbygoogle" style="display:block" data-ad-client="' + PUB +
    '" data-ad-slot="' + SLOT +
    '" data-ad-format="auto" data-full-width-responsive="true"></ins>';
  try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
})();
