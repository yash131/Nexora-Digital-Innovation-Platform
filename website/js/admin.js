/*
 * admin.js — dashboard logic.
 * NOTE: this is a client-side demo. The "login" is a preference stored in
 * localStorage, NOT authentication. See README.md for what production auth
 * would require.
 */
(function () {
  "use strict";

  var loginScreen = $id("login-screen");
  var adminView   = $id("admin");
  var uname       = $id("uname");
  var loginForm   = $id("login-form");

  function isLoggedIn() {
    try { return localStorage.getItem("nx-demo-logged-in") === "yes"; } catch (e) { return false; }
  }
  function login(name) {
    try {
      localStorage.setItem("nx-demo-logged-in", "yes");
      localStorage.setItem("nx-demo-user", name || "");
    } catch (e) {}
    showAdmin();
  }
  function logout() {
    try { localStorage.removeItem("nx-demo-logged-in"); localStorage.removeItem("nx-demo-user"); } catch (e) {}
    location.reload();
  }
  function showAdmin() {
    loginScreen.hidden = true;
    adminView.hidden = false;
    var name = "";
    try { name = localStorage.getItem("nx-demo-user") || ""; } catch (e) {}
    uname.textContent = name || "there";
    boot();
  }

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("demo-name").value.trim();
    login(name);
  });

  if (isLoggedIn()) { showAdmin(); }
  else              { loginScreen.hidden = false; }

  var logoutBtn = $id("admin-logout");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  /* ------------------------------------------------------------
   * Data preparation
   * ------------------------------------------------------------ */
  var orders = [];   // normalised copy
  var view   = [];   // filtered / sorted view
  var page   = 1;
  var pageSize = 25;
  var sortKey = "date";
  var sortDir = -1;  // -1 desc, 1 asc

  function normalise() {
    if (!window.ORDERS || !ORDERS.length) return;
    orders = ORDERS.map(function (o) {
      return {
        id: o.id,
        customer: o.customer,
        email: o.email,
        product: o.product,
        amount: parseFloat(o.amount) || 0,
        qty:    parseInt(o.qty, 10)  || 0,
        status: (o.status || "").toLowerCase().trim(),
        date:   parseInt(o.date, 10) || 0
      };
    });
  }

  function computeStats() {
    var totalRevenue = 0, itemsSold = 0;
    for (var i = 0; i < orders.length; i++) {
      totalRevenue += orders[i].amount;
      itemsSold    += orders[i].qty;
    }
    var count = orders.length;
    var avg = count ? totalRevenue / count : 0;

    $id("stat-revenue").textContent = "$" + formatNumber(Math.round(totalRevenue));
    $id("stat-orders").textContent  = formatNumber(count);
    $id("stat-avg").textContent     = "$" + avg.toFixed(2);
    $id("stat-qty").textContent     = formatNumber(itemsSold);
  }

  /* ------------------------------------------------------------
   * Table
   * ------------------------------------------------------------ */
  function applyFilter() {
    var q = ($id("tbl-search").value || "").trim().toLowerCase();
    view = orders.filter(function (o) {
      if (!q) return true;
      return (o.id + " " + o.customer + " " + o.email + " " + o.product).toLowerCase().indexOf(q) > -1;
    });
    applySort();
    page = 1;
    renderTable();
  }

  function applySort() {
    view.sort(function (a, b) {
      var av = a[sortKey], bv = b[sortKey];
      if (typeof av === "string") { av = av.toLowerCase(); bv = (bv || "").toLowerCase(); }
      if (av < bv) return -1 * sortDir;
      if (av > bv) return  1 * sortDir;
      return 0;
    });
  }

  function statusPill(status) {
    var cls = "pill";
    if (status === "paid")    cls += " pill--paid";
    else if (status === "pending") cls += " pill--pending";
    else if (status === "failed" || status === "refunded") cls += " pill--failed";
    var label = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";
    return '<span class="' + cls + '">' + escapeHtml(label) + '</span>';
  }

  function renderTable() {
    var tbody = $id("orders-body");
    var total = view.length | 0;
    var totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (!(page >= 1)) page = 1;
    if (page > totalPages) page = totalPages;
    var start = (page - 1) * pageSize;
    var slice = view.slice(start, start + pageSize);

    if (!slice.length) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:24px; color:var(--text-dim)">No orders match your search.</td></tr>';
    } else {
      var html = "";
      for (var i = 0; i < slice.length; i++) {
        var o = slice[i];
        html +=
          "<tr data-id=\"" + escapeHtml(o.id) + "\">" +
            "<td>" + escapeHtml(o.id) + "</td>" +
            "<td>" + escapeHtml(o.customer) + "</td>" +
            "<td>" + escapeHtml(o.email) + "</td>" +
            "<td>" + escapeHtml(o.product) + "</td>" +
            "<td>" + formatPrice(o.amount) + "</td>" +
            "<td>" + o.qty + "</td>" +
            "<td>" + statusPill(o.status) + "</td>" +
            "<td>" + escapeHtml(formatDate(o.date)) + "</td>" +
            "<td><button type=\"button\" class=\"icon-btn\" data-delete=\"" + escapeHtml(o.id) + "\" aria-label=\"Delete order " + escapeHtml(o.id) + "\">&#128465;</button></td>" +
          "</tr>";
      }
      tbody.innerHTML = html;
    }

    $id("page-info").textContent = total ?
      ("Showing " + (start + 1) + "–" + Math.min(total, start + pageSize) + " of " + formatNumber(total)) :
      "";

    renderPager(totalPages);
  }

  function renderPager(totalPages) {
    var pager = $id("pager");
    var buttons = [];
    var windowSize = 5;
    var startPage = Math.max(1, page - 2);
    var endPage   = Math.min(totalPages, startPage + windowSize - 1);
    startPage = Math.max(1, endPage - windowSize + 1);

    buttons.push('<button type="button" data-page="prev"' + (page === 1 ? " disabled" : "") + ' aria-label="Previous page">&larr;</button>');
    if (startPage > 1) buttons.push('<button type="button" data-page="1">1</button>' + (startPage > 2 ? '<span style="padding:6px">…</span>' : ""));
    for (var i = startPage; i <= endPage; i++) {
      buttons.push('<button type="button" data-page="' + i + '"' + (i === page ? ' class="is-active" aria-current="page"' : "") + '>' + i + '</button>');
    }
    if (endPage < totalPages) buttons.push((endPage < totalPages - 1 ? '<span style="padding:6px">…</span>' : "") + '<button type="button" data-page="' + totalPages + '">' + totalPages + '</button>');
    buttons.push('<button type="button" data-page="next"' + (page === totalPages ? " disabled" : "") + ' aria-label="Next page">&rarr;</button>');
    pager.innerHTML = buttons.join("");
  }

  /* ------------------------------------------------------------
   * Events
   * ------------------------------------------------------------ */
  function bindEvents() {
    $id("tbl-search").addEventListener("input", debounce(applyFilter, 200));

    $$("#orders-table thead button[data-sort]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-sort");
        if (sortKey === key) sortDir = -sortDir;
        else { sortKey = key; sortDir = (key === "date" || key === "amount" || key === "qty") ? -1 : 1; }
        applySort();
        renderTable();
      });
    });

    $id("orders-body").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-delete]");
      if (!btn) return;
      var id = btn.getAttribute("data-delete");
      if (!confirm("Delete order " + id + "?")) return;
      view    = view.filter(function (o) { return o.id !== id; });
      orders  = orders.filter(function (o) { return o.id !== id; });
      computeStats();
      renderTable();
      toast("Order " + id + " removed (demo only — not persisted).");
    });

    $id("pager").addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-page]");
      if (!btn || btn.disabled) return;
      var val = btn.getAttribute("data-page");
      var totalPages = Math.max(1, Math.ceil(view.length / pageSize));
      if (val === "prev") page = Math.max(1, page - 1);
      else if (val === "next") page = Math.min(totalPages, page + 1);
      else page = parseInt(val, 10) || 1;
      renderTable();
      window.scrollTo({ top: $id("orders-table").offsetTop - 120, behavior: "smooth" });
    });

    $id("tbl-export").addEventListener("click", exportCSV);

    $$("#admin-nav [data-view]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        $$("#admin-nav button").forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        // Simple demo behaviour: scroll to relevant section (all in one page).
        toast("Section: " + btn.textContent.trim());
      });
    });
  }

  function exportCSV() {
    if (!view.length) return toast("Nothing to export.");
    var header = ["id","customer","email","product","amount","qty","status","date"];
    var rows = [header.join(",")];
    for (var i = 0; i < view.length; i++) {
      var o = view[i];
      var row = [o.id, o.customer, o.email, o.product, o.amount.toFixed(2), o.qty, o.status, new Date(o.date).toISOString()]
        .map(function (v) { v = String(v == null ? "" : v); return '"' + v.replace(/"/g, '""') + '"'; });
      rows.push(row.join(","));
    }
    var blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "orders-" + Date.now() + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("Exported " + view.length + " rows.", { type: "success" });
  }

  /* ------------------------------------------------------------
   * Charts
   * ------------------------------------------------------------ */
  function renderCharts() {
    if (typeof Chart === "undefined") { setTimeout(renderCharts, 100); return; }

    var byProduct = {};
    var byStatus  = {};
    for (var i = 0; i < orders.length; i++) {
      var o = orders[i];
      byProduct[o.product] = (byProduct[o.product] || 0) + o.amount;
      byStatus[o.status || "unknown"] = (byStatus[o.status || "unknown"] || 0) + 1;
    }
    var productLabels = Object.keys(byProduct).slice(0, 8);
    var productData   = productLabels.map(function (k) { return Math.round(byProduct[k]); });
    var statusLabels  = Object.keys(byStatus);
    var statusData    = statusLabels.map(function (k) { return byStatus[k]; });

    var palette = ["#6366f1","#8b5cf6","#22d3ee","#ec4899","#f59e0b","#10b981","#3b82f6","#f43f5e"];
    var text = getComputedStyle(document.documentElement).getPropertyValue("--text-muted").trim() || "#a3a9b7";

    Chart.defaults.color = text;
    Chart.defaults.borderColor = "rgba(255,255,255,0.08)";

    new Chart($id("c1"), {
      type: "bar",
      data: { labels: productLabels, datasets: [{ label: "Revenue ($)", data: productData, backgroundColor: palette, borderRadius: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } }
    });

    new Chart($id("c2"), {
      type: "doughnut",
      data: { labels: statusLabels.map(function (s) { return s.charAt(0).toUpperCase() + s.slice(1); }), datasets: [{ data: statusData, backgroundColor: palette, borderColor: "transparent" }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: "68%", plugins: { legend: { position: "bottom" } } }
    });
  }

  /* ------------------------------------------------------------
   * Boot
   * ------------------------------------------------------------ */
  function boot() {
    normalise();
    if (!orders.length) {
      $id("orders-body").innerHTML = '<tr><td colspan="9" style="text-align:center; padding:24px; color:var(--text-dim)">No data loaded.</td></tr>';
      return;
    }
    computeStats();
    view = orders.slice();
    applySort();
    renderTable();
    bindEvents();
    renderCharts();
  }
})();
