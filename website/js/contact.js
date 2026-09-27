/*
 * contact.js — community forum + contact form.
 * Everything is in-browser (localStorage). Real submissions would require
 * a backend or a form service — see README.md for guidance.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "nx-threads";
  var seed = [
    { name: "Rahul",    text: "Just tried Nexora — the tools page is genuinely useful.",     t: Date.now() - 86400000 * 2 },
    { name: "Priya",    text: "Love the new dashboard. The pagination in the orders table works nicely.", t: Date.now() - 86400000 },
    { name: "Nexora Team", text: "Welcome, everyone! Please keep discussions kind and constructive.", t: Date.now() - 3600000 }
  ];

  var threads = loadThreads();

  function loadThreads() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return seed.slice();
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : seed.slice();
    } catch (e) {
      return seed.slice();
    }
  }
  function saveThreads() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(threads)); } catch (e) {}
  }

  function renderThreads() {
    var mount = $id("threads");
    if (!threads.length) {
      mount.innerHTML = '<div class="empty">No posts yet. Start the conversation.</div>';
      return;
    }
    var html = "";
    for (var i = threads.length - 1; i >= 0; i--) {
      var t = threads[i];
      html +=
        '<article class="card thread">' +
          '<div class="who"><span class="avatar" aria-hidden="true"></span>' +
            '<div>' +
              '<div class="who-name">' + escapeHtml(t.name) + '</div>' +
              '<div class="who-time">' + escapeHtml(timeAgo(t.t)) + '</div>' +
            '</div>' +
          '</div>' +
          '<p>' + escapeHtml(t.text) + '</p>' +
        '</article>';
    }
    mount.innerHTML = html;
  }

  /* ------------------------------------------------------------
   * Community form
   * ------------------------------------------------------------ */
  function initThreadForm() {
    var form = $id("thread-form");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = sanitize($id("thread-name").value).slice(0, 40);
      var text = sanitize($id("thread-body").value).slice(0, 500);
      if (!name || name.length < 2)  { toast("Please enter your name.", { type: "error" }); return; }
      if (!text || text.length < 3)  { toast("Please write a message.", { type: "error" }); return; }
      threads.push({ name: name, text: text, t: Date.now() });
      saveThreads();
      form.reset();
      renderThreads();
      toast("Posted to the community.", { type: "success" });
    });
  }

  /* ------------------------------------------------------------
   * Contact modal
   * ------------------------------------------------------------ */
  var modal   = $id("contact-modal");
  var openBtn = $id("open-contact");
  var closeBtn= $id("close-contact");

  function openContact() {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(function () {
      var f = $id("c-name"); if (f) f.focus();
    }, 30);
  }
  function closeContact() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }
  openBtn.addEventListener("click", openContact);
  closeBtn.addEventListener("click", closeContact);
  modal.addEventListener("click", function (e) { if (e.target === modal) closeContact(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) closeContact(); });

  /* ------------------------------------------------------------
   * Contact validation
   * ------------------------------------------------------------ */
  function setError(field, message) {
    var el = document.querySelector('[data-error-for="' + field + '"]');
    var input = document.getElementById(field);
    if (el) el.textContent = message || "";
    if (input) {
      if (message) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
    }
  }

  function showNotice(kind, message) {
    var el = $id("c-notice");
    el.hidden = false;
    el.className = "form-notice form-notice--" + kind;
    el.textContent = message;
  }
  function clearNotice() { var el = $id("c-notice"); el.hidden = true; el.textContent = ""; }

  function validate(values) {
    var errors = {};
    if (!values.name || values.name.length < 2)           errors["c-name"]    = "Please enter your name.";
    if (!isEmail(values.email))                            errors["c-email"]   = "Please enter a valid email address.";
    if (values.phone && !/^[0-9 +()\-]{5,20}$/.test(values.phone)) errors["c-phone"] = "Please enter a valid phone number.";
    if (!values.topic)                                     errors["c-topic"]   = "Please choose a topic.";
    if (!values.message || values.message.length < 20)     errors["c-message"] = "Please write at least 20 characters.";
    return errors;
  }

  function initContactForm() {
    var form = $id("contact-form");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearNotice();

      var values = {
        name:    sanitize($id("c-name").value),
        email:   $id("c-email").value.trim(),
        phone:   $id("c-phone").value.trim(),
        company: sanitize($id("c-company").value),
        team:    $id("c-team").value,
        topic:   $id("c-topic").value,
        message: sanitize($id("c-message").value),
        agree:   $id("c-agree").checked
      };

      ["c-name","c-email","c-phone","c-topic","c-message"].forEach(function (id) { setError(id, ""); });

      var errors = validate(values);
      var keys = Object.keys(errors);
      if (keys.length) {
        keys.forEach(function (k) { setError(k, errors[k]); });
        var first = document.getElementById(keys[0]);
        if (first) first.focus();
        showNotice("error", "Please fix the highlighted fields.");
        return;
      }

      var submit = $id("c-submit");
      submit.disabled = true;
      submit.textContent = "Sending…";

      // Simulate an async send. No network request is made in this demo.
      setTimeout(function () {
        submit.disabled = false;
        submit.textContent = "Send message";
        form.reset();
        showNotice("success", "Thanks — your message has been queued (demo only, no email is sent).");
      }, 700);
    });

    $id("c-reset").addEventListener("click", function () {
      $id("contact-form").reset();
      ["c-name","c-email","c-phone","c-topic","c-message"].forEach(function (id) { setError(id, ""); });
      clearNotice();
    });
  }

  /* ------------------------------------------------------------
   * Boot
   * ------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    renderThreads();
    initThreadForm();
    initContactForm();
  });
})();
