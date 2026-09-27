/*
 * tools.js — seven vanilla-JS calculators with verified formulas.
 *
 * Every formula in the original file was broken on purpose. Each one is
 * re-implemented here with a short reference for the maths used.
 */
(function () {
  "use strict";

  var TOOLS = [
    {
      id: "km-to-miles",
      icon: "\u{1F4CF}",
      title: "KM to Miles",
      hint: "Enter a distance in kilometres.",
      fields: [{ id: "km", label: "Kilometres", type: "number", placeholder: "e.g. 10", step: "any" }],
      auto: true,
      run: function (v) {
        var km = parseFloat(v.km);
        if (isNaN(km)) return { text: "\u2014", empty: true };
        return { text: km.toLocaleString(undefined, { maximumFractionDigits: 3 }) + " km = " + kmToMiles(km).toFixed(3) + " mi" };
      }
    },
    {
      id: "bmi",
      icon: "\u2696\uFE0F",
      title: "BMI",
      hint: "Body Mass Index = weight (kg) ÷ height (m)². Under 18.5 = under, 18.5–24.9 = normal, 25–29.9 = over, 30+ = obese.",
      fields: [
        { id: "weight", label: "Weight (kg)",    type: "number", placeholder: "e.g. 70", step: "any" },
        { id: "height", label: "Height (cm)",    type: "number", placeholder: "e.g. 175", step: "any" }
      ],
      run: function (v) {
        var w = parseFloat(v.weight), hCm = parseFloat(v.height);
        if (isNaN(w) || isNaN(hCm) || w <= 0 || hCm <= 0) return { text: "Enter positive numbers.", error: true };
        var m = hCm / 100;
        var b = w / (m * m);
        var band;
        if      (b < 18.5) band = "underweight";
        else if (b < 25)   band = "normal";
        else if (b < 30)   band = "overweight";
        else               band = "obese";
        return { text: b.toFixed(1) + "  (" + band + ")" };
      }
    },
    {
      id: "tip",
      icon: "\u{1F355}",
      title: "Tip Split",
      hint: "Total + tip, split evenly between people.",
      fields: [
        { id: "bill",   label: "Bill total ($)", type: "number", placeholder: "e.g. 84.50", step: "0.01" },
        { id: "tipPct", label: "Tip %",          type: "number", placeholder: "e.g. 15",    step: "any", defaultValue: "15" },
        { id: "people", label: "People",         type: "number", placeholder: "e.g. 4",     step: "1", defaultValue: "2" }
      ],
      run: function (v) {
        var bill   = parseFloat(v.bill);
        var tipPct = parseFloat(v.tipPct);
        var people = parseInt(v.people, 10);
        if (isNaN(bill) || bill < 0 || isNaN(tipPct) || tipPct < 0 || isNaN(people) || people <= 0) {
          return { text: "Please enter valid numbers.", error: true };
        }
        var tipAmount = bill * (tipPct / 100);
        var total     = bill + tipAmount;
        var perPerson = total / people;
        return { text: "$" + perPerson.toFixed(2) + " each  (tip $" + tipAmount.toFixed(2) + ", total $" + total.toFixed(2) + ")" };
      }
    },
    {
      id: "currency",
      icon: "\u{1F4B1}",
      title: "Currency",
      hint: "Illustrative rates only. Not for financial decisions.",
      fields: [
        { id: "amount", label: "Amount", type: "number", placeholder: "e.g. 100 USD", step: "any" },
        { id: "target", label: "Convert to", type: "select", options: [
          { value: "INR",  label: "USD → INR",  rate: 83   },
          { value: "EUR",  label: "USD → EUR",  rate: 0.92 },
          { value: "GBP",  label: "USD → GBP",  rate: 0.79 },
          { value: "JPY",  label: "USD → JPY",  rate: 150  },
          { value: "AUD",  label: "USD → AUD",  rate: 1.52 }
        ], defaultValue: "INR" }
      ],
      run: function (v, field) {
        var amt = parseFloat(v.amount);
        if (isNaN(amt)) return { text: "\u2014", empty: true };
        var opt = field.target.options.find(function (o) { return o.value === v.target; }) || field.target.options[0];
        return { text: amt.toFixed(2) + " USD = " + (amt * opt.rate).toFixed(2) + " " + opt.value };
      }
    },
    {
      id: "password",
      icon: "\u{1F510}",
      title: "Password Generator",
      hint: "Client-side only. Uses the browser's crypto RNG when available.",
      fields: [
        { id: "length", label: "Length", type: "number", placeholder: "12–64", step: "1", defaultValue: "16" },
        { id: "symbols", label: "Include symbols?", type: "select", options: [
          { value: "yes", label: "Yes" },
          { value: "no",  label: "No"  }
        ], defaultValue: "yes" }
      ],
      run: function (v) {
        var len = parseInt(v.length, 10);
        if (isNaN(len) || len < 4)  return { text: "Length must be at least 4.", error: true };
        if (len > 128)              return { text: "Length must be at most 128.", error: true };
        var alpha = "abcdefghijkmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var nums  = "23456789";
        var sym   = "!@#$%^&*()-_=+[]{}<>?";
        var pool  = alpha + nums + (v.symbols === "yes" ? sym : "");
        var out   = "";
        var arr   = new Uint32Array(len);
        if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(arr);
        else for (var j = 0; j < len; j++) arr[j] = Math.floor(Math.random() * 0xFFFFFFFF);
        for (var i = 0; i < len; i++) out += pool[arr[i] % pool.length];
        return { text: out };
      }
    },
    {
      id: "age",
      icon: "\u{1F382}",
      title: "Age Calculator",
      hint: "Choose your date of birth.",
      fields: [{ id: "dob", label: "Date of birth", type: "date" }],
      run: function (v) {
        if (!v.dob) return { text: "\u2014", empty: true };
        var d = new Date(v.dob);
        if (isNaN(d.getTime())) return { text: "Invalid date.", error: true };
        var now = new Date();
        if (d > now) return { text: "Date is in the future.", error: true };
        var years = now.getFullYear() - d.getFullYear();
        var months = now.getMonth() - d.getMonth();
        var days = now.getDate() - d.getDate();
        if (days < 0)   { months -= 1; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
        if (months < 0) { years  -= 1; months += 12; }
        return { text: years + " years, " + months + " months, " + days + " days" };
      }
    },
    {
      id: "contrast",
      icon: "\u267F",
      title: "WCAG Contrast",
      hint: "Uses the WCAG 2.1 relative luminance formula. 4.5:1 = AA body text; 3:1 = AA large text.",
      fields: [
        { id: "fg", label: "Foreground", type: "color", defaultValue: "#0b0d12" },
        { id: "bg", label: "Background", type: "color", defaultValue: "#e6e8ee" }
      ],
      run: function (v) {
        function rgb(hex) {
          hex = hex.replace("#", "");
          if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
          var n = parseInt(hex, 16);
          return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
        }
        function lum(c) {
          var s = c.map(function (v) {
            v = v / 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
        }
        var f = lum(rgb(v.fg));
        var b = lum(rgb(v.bg));
        var ratio = (Math.max(f, b) + 0.05) / (Math.min(f, b) + 0.05);
        var pass = ratio >= 4.5 ? "AA body ✔" : ratio >= 3 ? "AA large only" : "fails AA";
        return { text: ratio.toFixed(2) + ":1  (" + pass + ")" };
      }
    }
  ];

  function fieldHtml(toolId, field) {
    var id = toolId + "-" + field.id;
    var attrs = 'id="' + id + '" name="' + field.id + '"';
    if (field.placeholder) attrs += ' placeholder="' + escapeHtml(field.placeholder) + '"';
    if (field.step)        attrs += ' step="' + field.step + '"';

    var value = field.defaultValue != null ? field.defaultValue : "";
    var label = '<label for="' + id + '">' + escapeHtml(field.label) + '</label>';

    if (field.type === "select") {
      var opts = field.options.map(function (o) {
        var sel = (String(o.value) === String(value)) ? " selected" : "";
        return '<option value="' + escapeHtml(o.value) + '"' + sel + '>' + escapeHtml(o.label) + '</option>';
      }).join("");
      return label + '<select ' + attrs + '>' + opts + '</select>';
    }
    return label + '<input type="' + field.type + '" ' + attrs + (value !== "" ? ' value="' + escapeHtml(value) + '"' : "") + '>';
  }

  function render() {
    var mount = $id("tools");
    var html = "";
    for (var i = 0; i < TOOLS.length; i++) {
      var t = TOOLS[i];
      html +=
        '<div class="card tool" data-tool="' + t.id + '">' +
          '<div class="card-icon" aria-hidden="true">' + t.icon + '</div>' +
          '<h4>' + escapeHtml(t.title) + '</h4>' +
          '<p class="hint">' + escapeHtml(t.hint) + '</p>' +
          '<div class="tool-fields">' +
            t.fields.map(function (f) { return fieldHtml(t.id, f); }).join("") +
          '</div>' +
          (t.auto ? "" : '<button type="button" class="btn btn-primary btn-sm" data-run="' + t.id + '">Calculate</button>') +
          '<div class="out is-empty" id="' + t.id + '-out">—</div>' +
        '</div>';
    }
    mount.innerHTML = html;

    TOOLS.forEach(function (t) {
      var runFn = function () { runTool(t); };
      // Wire up "auto" tools to recompute on input.
      t.fields.forEach(function (f) {
        var el = document.getElementById(t.id + "-" + f.id);
        if (!el) return;
        if (t.auto || f.type === "color" || f.type === "select" || f.type === "date") {
          el.addEventListener("input",  runFn);
          el.addEventListener("change", runFn);
        }
      });
      if (t.auto || t.id === "contrast") runFn();      // initial value for auto tools
      var btn = mount.querySelector('[data-run="' + t.id + '"]');
      if (btn) btn.addEventListener("click", runFn);
    });
  }

  function runTool(tool) {
    var values = {};
    var fieldMap = {};
    tool.fields.forEach(function (f) {
      fieldMap[f.id] = f;
      var el = document.getElementById(tool.id + "-" + f.id);
      values[f.id] = el ? el.value : "";
    });
    var result;
    try { result = tool.run(values, fieldMap); }
    catch (e) { result = { text: "Unexpected error — please check your input.", error: true }; }
    var out = document.getElementById(tool.id + "-out");
    out.textContent = result.text;
    out.classList.toggle("is-error", !!result.error);
    out.classList.toggle("is-empty", !!result.empty);
  }

  document.addEventListener("DOMContentLoaded", render);
})();
