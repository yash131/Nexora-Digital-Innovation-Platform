/*
 * blog.js — post list, search, filter, pagination, likes.
 * Likes persist to localStorage (no backend in this demo).
 */
/* global $id, escapeHtml, timeAgo, debounce */
(function () {
  "use strict";

  var PER_PAGE = 9;
  var titles = [
    "The quiet death of productivity theatre",
    "Why we moved our storage layer to Postgres",
    "On building slowly and shipping fast",
    "The future is a feeling, not a feature",
    "Hot take: buttons should look like buttons",
    "Accessibility isn't theatre — it's the product",
    "How we scaled from 3 to 3,000 users",
    "The engineering behind our new home page",
    "Dark mode is a mindset",
    "Designing for the medium, not for a mood board",
    "A retrospective on our first year in public",
    "Notes from replacing QA with review culture"
  ];
  var cats = ["AI", "Engineering", "Design", "Life"];
  var authors = ["Sam Rivera", "Priya Sharma", "Jonas Weber", "Emi Tanaka", "Alex Rivera"];
  var lorem = "In a world that moves faster than ever — where every team is chasing velocity — we paused. Not because we had to, but because we chose to. Slowing down for two weeks changed how the team thought about shipping, and about the difference between motion and progress. Here's what we learned, in plain English.";

  var POSTS = [];
  for (var p = 0; p < 30; p++) {
    POSTS.push({
      id: p,
      title: titles[p % titles.length] + (p >= titles.length ? " (part " + (Math.floor(p / titles.length) + 1) + ")" : ""),
      cat: cats[p % cats.length],
      author: authors[p % authors.length],
      date: Date.now() - p * 86400000 * 6,
      readMinutes: 3 + (p % 5),
      img: "https://picsum.photos/id/" + ((p * 7 + 100) % 900 + 30) + "/800/500",
      body: lorem + " " + lorem
    });
  }

  var page = 1;
  var view = POSTS.slice();
  var liked = loadLikes();

  function loadLikes() {
    try { return JSON.parse(localStorage.getItem("nx-blog-likes")) || {}; } catch (e) { return {}; }
  }
  function saveLikes() {
    try { localStorage.setItem("nx-blog-likes", JSON.stringify(liked)); } catch (e) {}
  }

  function applyFilter() {
    var q  = ($id("blog-search").value || "").trim().toLowerCase();
    var cat = $id("blog-category").value;
    view = POSTS.filter(function (post) {
      var okCat = cat === "all" || post.cat === cat;
      var okQ = !q || (post.title + " " + post.body + " " + post.author).toLowerCase().indexOf(q) > -1;
      return okCat && okQ;
    });
    page = 1;
    render();
  }

  function likeCount(post) {
    var base = 8 + ((post.id * 31) % 120);       // deterministic baseline
    return base + (liked[post.id] ? 1 : 0);
  }

  function render() {
    var mount = $id("posts");
    var totalPages = Math.max(1, Math.ceil(view.length / PER_PAGE));
    if (page > totalPages) page = totalPages;
    var start = (page - 1) * PER_PAGE;
    var slice = view.slice(start, start + PER_PAGE);

    if (!slice.length) {
      mount.innerHTML = '<div class="empty">No articles match your search. Try a different keyword or category.</div>';
    } else {
      var html = "";
      for (var i = 0; i < slice.length; i++) {
        var post = slice[i];
        var isLiked = !!liked[post.id];
        html +=
          '<article class="post card" id="post-' + post.id + '">' +
            '<div class="post-img"><img loading="lazy" src="' + escapeHtml(post.img) + '" alt="Cover image for the article: ' + escapeHtml(post.title) + '"></div>' +
            '<div class="post-cat">' + escapeHtml(post.cat) + '</div>' +
            '<h4>' + escapeHtml(post.title) + '</h4>' +
            '<div class="post-meta">' + escapeHtml(post.author) + ' &middot; ' + escapeHtml(timeAgo(post.date)) + ' &middot; ' + post.readMinutes + ' min read</div>' +
            '<p class="post-body">' + escapeHtml(post.body) + '</p>' +
            '<div class="post-actions">' +
              '<button type="button" class="read-more" data-toggle="' + post.id + '" aria-expanded="false">Continue reading →</button>' +
              '<button type="button" class="like-btn ' + (isLiked ? "is-liked" : "") + '" data-like="' + post.id + '" aria-pressed="' + isLiked + '">' +
                (isLiked ? "♥" : "♡") + " <span>" + likeCount(post) + '</span>' +
              '</button>' +
            '</div>' +
          '</article>';
      }
      mount.innerHTML = html;
    }

    $id("blog-page-info").textContent = view.length ?
      ("Page " + page + " of " + totalPages + " — " + view.length + " article" + (view.length === 1 ? "" : "s")) : "";
    renderPager(totalPages);
  }

  function renderPager(totalPages) {
    var pager = $id("blog-pager");
    var out = [];
    out.push('<button type="button" data-page="prev"' + (page === 1 ? " disabled" : "") + ' aria-label="Previous page">&larr;</button>');
    for (var i = 1; i <= totalPages; i++) {
      out.push('<button type="button" data-page="' + i + '"' + (i === page ? ' class="is-active" aria-current="page"' : "") + '>' + i + '</button>');
    }
    out.push('<button type="button" data-page="next"' + (page === totalPages ? " disabled" : "") + ' aria-label="Next page">&rarr;</button>');
    pager.innerHTML = out.join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();

    $id("blog-search").addEventListener("input", debounce(applyFilter, 150));
    $id("blog-category").addEventListener("change", applyFilter);

    $id("posts").addEventListener("click", function (e) {
      var toggle = e.target.closest("[data-toggle]");
      if (toggle) {
        var article = document.getElementById("post-" + toggle.getAttribute("data-toggle"));
        var open = article.classList.toggle("is-open");
        toggle.textContent = open ? "Collapse ←" : "Continue reading →";
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        return;
      }
      var like = e.target.closest("[data-like]");
      if (like) {
        var id = like.getAttribute("data-like");
        if (liked[id]) delete liked[id];
        else liked[id] = true;
        saveLikes();
        var post = POSTS[id];
        like.classList.toggle("is-liked", !!liked[id]);
        like.setAttribute("aria-pressed", !!liked[id]);
        like.innerHTML = (liked[id] ? "♥" : "♡") + " <span>" + likeCount(post) + "</span>";
      }
    });

    $id("blog-pager").addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-page]");
      if (!btn || btn.disabled) return;
      var v = btn.getAttribute("data-page");
      var totalPages = Math.max(1, Math.ceil(view.length / PER_PAGE));
      if (v === "prev") page = Math.max(1, page - 1);
      else if (v === "next") page = Math.min(totalPages, page + 1);
      else page = parseInt(v, 10) || 1;
      render();
      window.scrollTo({ top: $id("posts").offsetTop - 120, behavior: "smooth" });
    });

    // reading progress
    var progress = $id("reading-progress");
    window.addEventListener("scroll", function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var pct = h > 0 ? Math.min(100, Math.max(0, (window.scrollY / h) * 100)) : 0;
      progress.style.width = pct + "%";
    }, { passive: true });
  });
})();
