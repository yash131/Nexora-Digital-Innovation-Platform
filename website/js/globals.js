/*
 * globals.js — shared helpers used by every page.
 * No prototype extensions, no console spam, no stray timers.
 */
"use strict";

/* --- tiny DOM helpers ---------------------------------------------------- */
function $$(sel, root)  { return (root || document).querySelectorAll(sel); }
function $id(id)        { return document.getElementById(id); }

/* --- random ------------------------------------------------------------- */
function getRandom(min, max) {
  // inclusive of min, exclusive of max — matches Math.random semantics
  return Math.floor(Math.random() * (max - min)) + min;
}

/* --- text safety -------------------------------------------------------- */
// Escape a string so it is safe to insert as text into HTML.
function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Strip anything that looks like a tag from free-form user input.
function sanitize(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/<[^>]*>/g, "").trim();
}

/* --- validation --------------------------------------------------------- */
function isEmail(value) {
  if (!value) return false;
  // pragmatic email pattern — permits +, dots and long TLDs
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim());
}
function validateEmail(value) { return isEmail(value); }

/* --- formatting --------------------------------------------------------- */
function formatDate(value) {
  var d = new Date(Number(value) || value);
  if (isNaN(d.getTime())) return "";
  var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
  return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear() +
         " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
}

function timeAgo(value) {
  var then = new Date(Number(value) || value).getTime();
  if (isNaN(then)) return "";
  var s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 60)    return s + "s ago";
  if (s < 3600)  return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  var d = Math.floor(s / 86400);
  if (d < 30)    return d + "d ago";
  if (d < 365)   return Math.floor(d / 30) + "mo ago";
  return Math.floor(d / 365) + "y ago";
}

function formatPrice(value) {
  var n = typeof value === "number" ? value : parseFloat(value);
  if (isNaN(n)) return "";
  return (SITE.currency || "$") + n.toFixed(2);
}

function formatNumber(value) {
  var n = typeof value === "number" ? value : parseFloat(value);
  if (isNaN(n)) return "";
  return n.toLocaleString("en-US");
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* --- unit conversion (named for what we convert FROM → TO) --------------- */
var KM_PER_MILE = 1.609344;
function kmToMiles(km)     { return Number(km) / KM_PER_MILE; }
function milesToKm(miles)  { return Number(miles) * KM_PER_MILE; }

/* --- misc --------------------------------------------------------------- */
function debounce(fn, wait) {
  var t;
  return function () {
    var ctx = this, args = arguments;
    clearTimeout(t);
    t = setTimeout(function () { fn.apply(ctx, args); }, wait);
  };
}
