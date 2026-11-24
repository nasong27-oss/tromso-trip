(function () {
  "use strict";
  var T = window.TRIP;
  var app = document.getElementById("app");

  var TABS = [
    { id: "home", label: "일정" },
    { id: "cost", label: "비용 상세" },
    { id: "stay1", label: "12/25–28 숙소" },
    { id: "stay2", label: "12/28–30 숙소" },
    { id: "stay3", label: "12/30–1/1 숙소" },
    { id: "aurora", label: "오로라 투어" },
    { id: "car", label: "렌터카" },
    { id: "picks", label: "추천" }
  ];

  /* ---------------- helpers ---------------- */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  // **bold** 만 지원하는 아주 작은 마크업
  function md(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"); }
  function krw(n) { return "₩" + Math.round(n).toLocaleString("ko-KR"); }
  function nok(n) { return n.toLocaleString("ko-KR", { maximumFractionDigits: 2 }) + " NOK"; }
  function wm(file, w) { return "https://commons.wikimedia.org/wiki/Special:FilePath/" + file + "?width=" + (w || 640); }
  function wmPage(file) { return "https://commons.wikimedia.org/wiki/File:" + file; }
  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key) || "null");
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }

  var WEEK = ["일", "월", "화", "수", "목", "금", "토"];
  var MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  function mapSrc(m) {
    if (m.from) {
      return "https://www.google.com/maps?saddr=" + encodeURIComponent(m.from) +
        "&daddr=" + encodeURIComponent(m.to) + "&hl=ko&output=embed";
    }
    return "https://www.google.com/maps?q=" + encodeURIComponent(m.q) + "&hl=ko&z=13&output=embed";
  }
  function mapOpenHref(m) {
    if (m.open) return m.open;
    if (m.from) return "https://www.google.com/maps/dir/?api=1&origin=" + encodeURIComponent(m.from) + "&destination=" + encodeURIComponent(m.to);
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(m.q);
  }
  function mapBlock(m, open) {
    return '<details class="map"' + (open ? " open" : "") + ">" +
      '<summary><span class="map-ic" aria-hidden="true"></span>' + esc(m.label || "지도") + "<span class=\"map-toggle\">지도</span></summary>" +
      '<div class="map-frame"><iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="' + esc(m.label || "지도") + '" data-src="' + esc(mapSrc(m)) + '"></iframe></div>' +
      '<a class="map-open" href="' + esc(mapOpenHref(m)) + '" target="_blank" rel="noopener">' + esc(m.openLabel || "구글맵에서 열기") + " ↗</a>" +
      "</details>";
  }
  // details 안의 iframe 은 펼칠 때 로드 (작고 가벼운 페이지 유지)
  function wireMaps(root) {
    root.querySelectorAll("details.map").forEach(function (d) {
      function load() {
        var f = d.querySelector("iframe");
        if (f && !f.src) f.src = f.getAttribute("data-src");
      }
      if (d.open) load();
      d.addEventListener("toggle", function () { if (d.open) load(); });
    });
  }

  function head(eyebrow, title, sub) {
    return '<header class="sec-head"><p class="eyebrow">' + esc(eyebrow) + "</p>" +
      '<h2 class="sec-title">' + esc(title) + "</h2>" +
      (sub ? '<p class="sec-sub">' + esc(sub) + "</p>" : "") + "</header>";
  }
  function facts(list) {
    return '<div class="facts">' + list.map(function (f) {
      return '<div class="fact' + (f.muted ? " is-muted" : "") + '"><span class="fact-k">' + esc(f.k) + "</span>" +
        '<span class="fact-v">' + esc(f.v) +
        (f.copy ? ' <button class="copy" data-copy="' + esc(f.v) + '" aria-label="복사">복사</button>' : "") +
        "</span>" + (f.s ? '<span class="fact-s">' + esc(f.s) + "</span>" : "") + "</div>";
    }).join("") + "</div>";
  }
  function callout(w) {
    if (!w) return "";
    return '<aside class="callout ' + (w.tone || "warn") + '"><p class="callout-h">' + esc(w.title) + "</p><ul>" +
      w.items.map(function (i) { return "<li>" + md(i) + "</li>"; }).join("") + "</ul>" +
      (w.cta ? '<a class="btn" href="' + esc(w.cta.href) + '" target="_blank" rel="noopener">' + esc(w.cta.label) + " ↗</a>" : "") +
      "</aside>";
  }
  function section(s) {
    var body = "";
    if (s.list) body += '<ul class="list">' + s.list.map(function (i) { return "<li>" + md(i) + "</li>"; }).join("") + "</ul>";
    if (s.chips) body += '<div class="chips">' + s.chips.map(function (c) { return "<span>" + esc(c) + "</span>"; }).join("") + "</div>";
    if (s.recycle) body += '<div class="recycle">' + s.recycle.map(function (r) {
      return '<div class="bin"><i style="background:' + esc(r.color) + '"></i><b>' + esc(r.label) + "</b><span>" + esc(r.what) + "</span></div>";
    }).join("") + "</div>" + (s.note ? '<p class="note">' + esc(s.note) + "</p>" : "");
    if (s.details) body += '<details class="more"><summary>전체 목록 보기</summary><ul class="list">' +
      s.details.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul></details>";
    return '<section class="block"><h3 class="block-h">' + esc(s.h) + "</h3>" + body + "</section>";
  }
  function links(arr) {
    if (!arr || !arr.length) return "";
    return '<div class="links">' + arr.map(function (l) {
      var ext = /^https?:/.test(l.href);
      return '<a class="link-pill" href="' + esc(l.href) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + esc(l.label) + (ext ? " ↗" : "") + "</a>";
    }).join("") + "</div>";
  }
  function addressBlock(d) {
    return '<section class="block"><h3 class="block-h">위치</h3><p class="addr">' + esc(d.address) + "</p>" +
      mapBlock({ label: "지도 보기", q: d.mapQ, open: d.mapOpen }, true) + "</section>";
  }

  /* ---------------- dates ---------------- */
  function daysUntil(iso) { return Math.ceil((new Date(iso) - new Date()) / 86400000); }
  function fmtLocal(iso) {
    // 노르웨이 현지 시각(UTC+1)으로 표기
    var d = new Date(new Date(iso).getTime() + 3600000);
    return (d.getUTCMonth() + 1) + "/" + d.getUTCDate() + " (" + WEEK[d.getUTCDay()] + ") " +
      String(d.getUTCHours()).padStart(2, "0") + ":" + String(d.getUTCMinutes()).padStart(2, "0");
  }
  function relLabel(iso) {
    var ms = new Date(iso) - new Date();
    if (ms < 0) return { t: "지남", cls: "past" };
    var d = Math.floor(ms / 86400000);
    if (d === 0) return { t: "오늘", cls: "soon" };
    return { t: "D-" + d, cls: d <= 3 ? "soon" : "" };
  }

  /* ---------------- views ---------------- */
  function viewHome() {
    var dd = daysUntil(T.start);
    var ddText = dd > 0 ? "D-" + dd : dd === 0 ? "D-DAY" : "여행 중";

    var upcoming = T.deadlines.filter(function (x) { return new Date(x.at) > new Date(); })
      .sort(function (a, b) { return new Date(a.at) - new Date(b.at); });

    var h = "";
    h += '<section class="intro">' +
      '<div class="stats">' +
      '<div class="stat"><span class="stat-v serif">' + ddText + '</span><span class="stat-k">출발까지</span></div>' +
      '<div class="stat"><span class="stat-v serif">8박</span><span class="stat-k">12/24 – 1/1</span></div>' +
      '<div class="stat"><span class="stat-v serif">3</span><span class="stat-k">숙소</span></div>' +
      '<div class="stat"><span class="stat-v serif">' + T.travelers + '</span><span class="stat-k">여행자</span></div>' +
      "</div></section>";

    if (upcoming.length) {
      h += '<section class="block"><p class="eyebrow">KEY DATES</p><h3 class="block-h big">놓치면 안 되는 시간</h3><ol class="deadlines">' +
        upcoming.map(function (x) {
          var r = relLabel(x.at);
          return '<li class="' + (x.urgent ? "urgent" : "") + '"><a href="#' + x.tab + '">' +
            '<span class="dl-when">' + fmtLocal(x.at) + "</span>" +
            '<span class="dl-what">' + esc(x.title) + "</span>" +
            '<span class="dl-rel ' + r.cls + '">' + r.t + "</span></a></li>";
        }).join("") + '</ol><p class="note">시간은 모두 노르웨이 현지 기준 (한국보다 8시간 늦음)</p></section>';
    }

    h += '<section class="block"><p class="eyebrow">STAY</p><h3 class="block-h big">숙소 3곳</h3><div class="stay-cards">' +
      T.stays.map(function (s, i) {
        return '<a class="stay-card" href="#' + s.tab + '"><span class="stay-no serif">0' + (i + 1) + "</span>" +
          '<span class="stay-label">' + esc(s.label) + " · " + s.nights + "박</span>" +
          '<span class="stay-dates">' + esc(s.dates) + "</span>" +
          '<span class="stay-name">' + esc(s.name) + "</span>" +
          '<span class="stay-area">' + esc(s.area) + "</span></a>";
      }).join("") + "</div></section>";

    h += '<section class="block"><p class="eyebrow">ITINERARY</p><h3 class="block-h big">일자별 일정</h3><ol class="days">';
    T.days.forEach(function (d) {
      var dt = new Date(d.date + "T12:00:00Z");
      h += '<li class="day tone-' + d.tone + '">' +
        '<div class="day-date"><span class="day-num serif">' + dt.getUTCDate() + "</span>" +
        '<span class="day-mon">' + MON[dt.getUTCMonth()] + " · " + WEEK[dt.getUTCDay()] + "</span></div>" +
        '<div class="day-body"><span class="tag">' + esc(d.tag) + "</span><ul>" +
        d.items.map(function (it) {
          var inner = (it.time ? '<span class="time">' + esc(it.time) + "</span>" : "") +
            '<span class="txt">' + md(it.text) + "</span>";
          return "<li>" + (it.tab ? '<a href="#' + it.tab + '">' + inner + '<span class="go">›</span></a>' : inner) + "</li>";
        }).join("") + "</ul>" +
        (d.maps ? d.maps.map(function (m) { return mapBlock(m, false); }).join("") : "") +
        (d.quote ? '<blockquote class="quote">' + esc(d.quote) + "</blockquote>" : "") +
        "</div></li>";
    });
    h += "</ol></section>";

    var done = store("tt-check") || {};
    h += '<section class="block"><p class="eyebrow">BEFORE YOU GO</p><h3 class="block-h big">출발 전 체크리스트</h3><ul class="checks">' +
      T.checklist.map(function (c) {
        return '<li><label><input type="checkbox" data-id="' + c.id + '"' + (done[c.id] ? " checked" : "") + ">" +
          "<span>" + esc(c.text) + (c.link ? ' <a href="' + esc(c.link) + '" target="_blank" rel="noopener">링크 ↗</a>' : "") + "</span></label></li>";
      }).join("") + '</ul><p class="note">체크 상태는 이 기기에만 저장돼요.</p></section>';
    return h;
  }

  function viewCost() {
    var items = T.cost.items;
    var known = items.filter(function (i) { return i.krw; });
    var total = known.reduce(function (s, i) { return s + i.krw; }, 0);
    var paid = known.filter(function (i) { return i.status === "paid"; }).reduce(function (s, i) { return s + i.krw; }, 0);
    var onsite = known.filter(function (i) { return i.status === "onsite"; }).reduce(function (s, i) { return s + i.krw; }, 0);
    var other = total - paid - onsite;
    var max = Math.max.apply(null, known.map(function (i) { return i.krw; }));
    var STATUS = { paid: ["결제 완료", "ok"], onsite: ["현지 결제", "pend"], tbd: ["추가 예정", "tbd"], "": ["상태 미기재", "none"] };

    var h = head("COST", "비용 상세", "엑셀 「비용 정리」 기준 · " + T.travelers + "명 균등 분담");
    h += '<div class="total"><div><span class="total-k">총 비용 (확정분)</span><span class="total-v serif">' + krw(total) + "</span></div>" +
      '<div><span class="total-k">1인당</span><span class="total-v serif">' + krw(total / T.travelers) + "</span></div></div>";

    h += '<div class="split" role="img" aria-label="결제 상태 비율">' +
      '<i class="ok" style="flex:' + paid + '"></i><i class="pend" style="flex:' + onsite + '"></i><i class="none" style="flex:' + other + '"></i></div>' +
      '<div class="split-legend">' +
      '<span><i class="ok"></i>결제 완료 ' + krw(paid) + "</span>" +
      '<span><i class="pend"></i>현지 결제 예정 ' + krw(onsite) + "</span>" +
      '<span><i class="none"></i>상태 미기재 ' + krw(other) + "</span></div>";

    h += '<ul class="cost-list">' + items.map(function (i) {
      var st = STATUS[i.status] || STATUS[""];
      return '<li><a href="#' + i.tab + '">' +
        '<div class="cost-top"><span class="cost-name">' + esc(i.name) + ' <em>' + esc(i.sub) + "</em></span>" +
        '<span class="badge ' + st[1] + '">' + st[0] + "</span></div>" +
        (i.krw ? '<div class="bar"><i style="width:' + (i.krw / max * 100).toFixed(1) + '%"></i></div>' : "") +
        '<div class="cost-nums"><span class="cost-krw">' + (i.krw ? krw(i.krw) : "—") + "</span>" +
        "<span>" + (i.nok ? nok(i.nok) : "") + "</span>" +
        "<span>" + (i.krw ? "1인 " + krw(i.krw / T.travelers) : "") + "</span></div></a></li>";
    }).join("") + "</ul>";
    h += '<p class="note">MOXY 숙박비는 확정되면 합계에 더해집니다. 렌터카는 픽업 시 현지에서 결제해요.</p>';
    return h;
  }

  function viewDetail(d, extra) {
    var h = head(d.eyebrow, d.title, d.original);
    if (d.image) {
      h += '<figure class="detail-img"><img src="' + esc(d.image) + '" alt="" loading="lazy">' +
        (d.imageCredit ? '<figcaption><a href="' + esc(d.imageCredit.href) + '" target="_blank" rel="noopener">' + esc(d.imageCredit.text) + "</a></figcaption>" : "") + "</figure>";
    }
    h += facts(d.facts);
    h += callout(d.warn);
    if (extra) h += extra;
    h += addressBlock(d);
    (d.sections || []).forEach(function (s) { h += section(s); });
    h += links(d.links);
    return h;
  }

  function cancelBlock(cb) {
    var days = Math.floor((new Date(cb.checkin) - new Date()) / 86400000);
    var activeIdx = cb.bands.findIndex(function (b) { return days >= b.minDays; });
    return '<section class="block"><h3 class="block-h">취소 · 환불 <span class="muted">오늘 기준 체크인 ' + Math.max(days, 0) + "일 전</span></h3>" +
      '<ol class="bands">' + cb.bands.map(function (b, i) {
        return '<li class="' + (i === activeIdx ? "on" : i < activeIdx ? "gone" : "") + '">' + esc(b.text) +
          (i === activeIdx ? '<span class="now">현재</span>' : "") + "</li>";
      }).join("") + '</ol><p class="note">' + esc(cb.note) + "</p></section>";
  }

  function breakdownBlock(rows) {
    var max = Math.max.apply(null, rows.map(function (r) { return r.v; }));
    var sum = rows.reduce(function (s, r) { return s + r.v; }, 0);
    return '<section class="block"><h3 class="block-h">요금 내역 <span class="muted">합계 ' + nok(sum) + "</span></h3>" +
      '<ul class="breakdown">' + rows.map(function (r) {
        return "<li><span class=\"bd-k\">" + esc(r.k) + '</span><span class="bd-v">' + nok(r.v) + "</span>" +
          '<span class="bar"><i style="width:' + (r.v / max * 100).toFixed(1) + '%"></i></span></li>';
      }).join("") + "</ul></section>";
  }

  function viewPicks() {
    var P = T.picks;
    var h = head("PICKS", "트롬쇠 여행 추천", "노션 「트롬쇠 여행 추천 사항 (by ChatGPT)」 정리");
    P.groups.forEach(function (g) {
      h += '<section class="block"><p class="stars" aria-label="별 ' + g.stars + '개">' + "★★★★★".slice(0, g.stars) + '<span>' + "★★★★★".slice(g.stars) + "</span></p>" +
        '<h3 class="block-h big">' + esc(g.title) + '</h3><div class="picks">';
      g.items.forEach(function (it) {
        h += '<article class="pick">';
        if (it.imgs && it.imgs.length) {
          h += '<div class="pick-imgs n' + it.imgs.length + '">' + it.imgs.map(function (f) {
            return '<a href="' + esc(wmPage(f)) + '" target="_blank" rel="noopener" title="Wikimedia Commons"><img src="' + esc(wm(f, 640)) + '" alt="' + esc(it.name) + '" loading="lazy"></a>';
          }).join("") + "</div>";
        }
        h += '<div class="pick-body"><h4>' + esc(it.name) + (it.time ? ' <span class="pick-time">' + esc(it.time) + "</span>" : "") + "</h4>" +
          "<p>" + esc(it.desc) + "</p>" +
          (it.link ? '<a class="muted-link" href="' + esc(it.link.href) + '" target="_blank" rel="noopener">' + esc(it.link.label) + " ↗</a>" : "") +
          "</div></article>";
      });
      h += "</div></section>";
    });
    h += '<section class="block"><p class="stars">★★★<span>★★</span></p><h3 class="block-h big">그 밖에</h3><dl class="extras">' +
      P.extras.map(function (e) { return "<div><dt>" + esc(e.k) + "</dt><dd>" + esc(e.v) + "</dd></div>"; }).join("") + "</dl></section>";
    h += '<aside class="callout info"><p class="callout-h">한 줄 정리</p><p>' + esc(P.summary) + "</p></aside>";
    h += '<p class="note">사진: Wikimedia Commons (CC BY / CC BY-SA) — 사진을 누르면 원본 및 작가 정보로 이동</p>';
    return h;
  }

  var VIEWS = {
    home: viewHome,
    cost: viewCost,
    stay1: function () { return viewDetail(T.stay1); },
    stay2: function () { return viewDetail(T.stay2, cancelBlock(T.stay2.cancelBands)); },
    stay3: function () { return viewDetail(T.stay3); },
    aurora: function () { return viewDetail(T.aurora); },
    car: function () { return viewDetail(T.car, breakdownBlock(T.car.breakdown)); },
    picks: viewPicks
  };

  /* ---------------- router ---------------- */
  var tabsEl = document.querySelector("#tabs .tabs-inner");
  tabsEl.innerHTML = TABS.map(function (t) {
    return '<a role="tab" href="#' + t.id + '" data-tab="' + t.id + '">' + esc(t.label) + "</a>";
  }).join("");

  function current() {
    var id = (location.hash || "#home").slice(1);
    return VIEWS[id] ? id : "home";
  }
  function render(scroll) {
    var id = current();
    app.innerHTML = '<div class="view view-' + id + '">' + VIEWS[id]() + "</div>";
    tabsEl.querySelectorAll("a").forEach(function (a) {
      var on = a.getAttribute("data-tab") === id;
      a.classList.toggle("on", on);
      a.setAttribute("aria-selected", on ? "true" : "false");
      if (on && a.scrollIntoView) {
        var box = tabsEl.getBoundingClientRect(), r = a.getBoundingClientRect();
        if (r.left < box.left || r.right > box.right) tabsEl.scrollLeft += (r.left - box.left) - 16;
      }
    });
    wireMaps(app);
    if (scroll) {
      var nav = document.getElementById("tabs");
      var y = nav.offsetTop;
      if (window.scrollY > y) window.scrollTo(0, y);
    }
  }

  document.getElementById("heroMeta").textContent = T.period + " · " + T.travelers + "명";
  document.querySelector(".hero-img").style.backgroundImage = "url('" + T.heroImage + "')";

  window.addEventListener("hashchange", function () { render(true); });
  render(false);

  /* ---------------- interactions ---------------- */
  app.addEventListener("change", function (e) {
    var t = e.target;
    if (t.matches(".checks input[type=checkbox]")) {
      var s = store("tt-check") || {};
      s[t.getAttribute("data-id")] = t.checked;
      store("tt-check", s);
    }
  });
  app.addEventListener("click", function (e) {
    var b = e.target.closest(".copy");
    if (!b) return;
    var v = b.getAttribute("data-copy");
    var done = function () { b.textContent = "복사됨"; setTimeout(function () { b.textContent = "복사"; }, 1400); };
    if (navigator.clipboard) navigator.clipboard.writeText(v).then(done, function () {});
  });
})();
