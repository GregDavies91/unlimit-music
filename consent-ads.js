// Consent-gated ads (UK GDPR / PECR).
// AdSense script is injected ONLY after an explicit Accept click.
// Reject => no ad script ever loads. Network-agnostic: set SITE_CONFIG.ADSENSE_PUB_ID.
(function () {
  "use strict";

  var PUB = (window.SITE_CONFIG && window.SITE_CONFIG.ADSENSE_PUB_ID) || "ca-pub-REPLACE_WITH_YOUR_ID";
  var slot = document.getElementById("ad-slot");
  var consentEl = document.getElementById("consent");
  var KEY = "um_consent";

  function loadAds() {
    if (!slot) return;
    // build the auto ad (or a display ad). Using auto-ads: just load the script.
    if (PUB.indexOf("REPLACE") !== -1) {
      // not configured yet -> show a placeholder so layout is stable
      slot.innerHTML = '<div class="ad-placeholder">Ad space &mdash; set ADSENSE_PUB_ID in config.js</div>';
      return;
    }
    var s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(PUB);
    document.head.appendChild(s);
    // render an ad unit into the slot
    slot.innerHTML = '<ins class="adsbygoogle" style="display:block" data-ad-client="' + PUB +
      '" data-ad-slot="0000000000" data-ad-format="auto" data-full-width-responsive="true"></ins>';
    (window.adsbygoogle = window.adsbygoogle || []).push({});
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

  // if already decided, honour it (don't re-prompt)
  var decided = null;
  try { decided = localStorage.getItem(KEY); } catch (e) {}
  if (decided === "1") { if (consentEl) consentEl.classList.add("hide"); loadAds(); }
  else if (decided === "0") { if (consentEl) consentEl.classList.add("hide"); }
})();
