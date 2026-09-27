/*
 * home.js — revenue counter animation.
 * Uses a static baseline so the home page doesn't need to load the
 * 1.2 MB orders dataset that only the admin dashboard actually needs.
 */
(function () {
  var el = document.getElementById("revenue-counter");
  if (!el) return;

  var target = 4820000;    // stable reference value
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce) {
    el.textContent = "$" + target.toLocaleString();
    return;
  }

  var start = 0;
  var duration = 1600;
  var t0 = null;

  function step(t) {
    if (t0 === null) t0 = t;
    var p = Math.min(1, (t - t0) / duration);
    var eased = 1 - Math.pow(1 - p, 3);
    var value = Math.floor(start + (target - start) * eased);
    el.textContent = "$" + value.toLocaleString();
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
})();
