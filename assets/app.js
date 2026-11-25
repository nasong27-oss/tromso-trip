(function () {
  "use strict";

  /* =========================================================
     상태
     ========================================================= */
  var DEFAULT = clone(window.TRIP);   // data.js 원본 (첫 저장 시 이력에 보관)
  var DOC = clone(window.TRIP);       // 화면에 보이는 현재 내용
  var VERSION = null;                 // 서버에 저장된 최신 버전 id
  var WORK = null;                    // 편집 중인 사본
  var editing = false;
  var dirty = false;
  var app = document.getElementById("app");

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function D() { return editing ? WORK : DOC; }

  var TABS = [
    { id: "home", label: "일정" },
    { id: "map", label: "지도" },
    { id: "cost", label: "비용 상세" },
    { id: "stay1", label: "12/25–28 숙소" },
    { id: "stay2", label: "12/28–30 숙소" },
    { id: "stay3", label: "12/30–1/1 숙소" },
    { id: "aurora", label: "오로라 투어" },
    { id: "car", label: "렌터카" },
    { id: "picks", label: "추천" },
    { id: "info", label: "추가 정보" }
  ];

  /* =========================================================
     기본 도우미
     ========================================================= */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function md(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"); }
  function krw(n) { return "₩" + Math.round(n || 0).toLocaleString("ko-KR"); }
  function nok(n) { return Number(n || 0).toLocaleString("ko-KR", { maximumFractionDigits: 2 }) + " NOK"; }
  function wm(file, w) { return "https://commons.wikimedia.org/wiki/Special:FilePath/" + file + "?width=" + (w || 640); }
  function wmPage(file) { return "https://commons.wikimedia.org/wiki/File:" + file; }
  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key) || "null");
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }
  function getPath(o, p) {
    return p.split(".").reduce(function (a, k) { return a == null ? a : a[k]; }, o);
  }
  function setPath(o, p, v) {
    var ks = p.split("."), last = ks.pop();
    var t = ks.reduce(function (a, k) { return a[k]; }, o);
    t[last] = v;
  }

  var WEEK = ["일", "월", "화", "수", "목", "금", "토"];
  var MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  /* ---------- 날짜 ---------- */
  function daysUntil(iso) { return Math.ceil((new Date(iso) - new Date()) / 86400000); }
  function osloParts(iso) { // 노르웨이 현지(UTC+1)
    var d = new Date(new Date(iso).getTime() + 3600000);
    return { y: d.getUTCFullYear(), mo: d.getUTCMonth() + 1, d: d.getUTCDate(), w: d.getUTCDay(), h: d.getUTCHours(), mi: d.getUTCMinutes() };
  }
  function pad(n) { return String(n).padStart(2, "0"); }
  function fmtLocal(iso) {
    var p = osloParts(iso);
    if (isNaN(p.y)) return "날짜 확인";
    return p.mo + "/" + p.d + " (" + WEEK[p.w] + ") " + pad(p.h) + ":" + pad(p.mi);
  }
  function fmtDate(iso) { // 날짜만 (한국 날짜 기준)
    var d = new Date(new Date(iso).getTime() + 9 * 3600000);
    return (d.getUTCMonth() + 1) + "/" + d.getUTCDate() + " (" + WEEK[d.getUTCDay()] + ")";
  }
  function isoToInput(iso) {
    var p = osloParts(iso);
    return isNaN(p.y) ? "" : p.y + "-" + pad(p.mo) + "-" + pad(p.d) + " " + pad(p.h) + ":" + pad(p.mi);
  }
  function inputToIso(s) {
    var m = String(s).trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{2})$/);
    return m ? m[1] + "-" + pad(m[2]) + "-" + pad(m[3]) + "T" + pad(m[4]) + ":" + m[5] + ":00+01:00" : null;
  }
  function relLabel(iso) {
    var ms = new Date(iso) - new Date();
    if (isNaN(ms)) return { t: "", cls: "" };
    if (ms < 0) return { t: "지남", cls: "past" };
    var d = Math.floor(ms / 86400000);
    if (d === 0) return { t: "오늘", cls: "soon" };
    return { t: "D-" + d, cls: d <= 3 ? "soon" : "" };
  }

  /* =========================================================
     편집 가능한 조각 만들기
     - 보기 모드: 평소처럼 글자만
     - 편집 모드: data-p(경로)가 달린 편집 칸
     ========================================================= */
  function E(path, opts) {
    opts = opts || {};
    var v = getPath(D(), path);
    if (!editing) {
      if (v == null || v === "") return "";
      if (opts.view) return opts.view(v);
      return opts.plain ? esc(v) : md(v);
    }
    // 굵게가 가능한 칸(md): 실제 굵은 글씨로 보여주고 B 버튼으로 바꾼다. 나머지는 글자만
    var kind = opts.kind || (opts.plain ? "text" : "md");
    var raw = kind === "dt" ? isoToInput(v) : (v == null ? "" : String(v));
    var html = kind === "md" ? esc(raw).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>") : esc(raw);
    return '<span class="ed' + (opts.block ? " ed-block" : "") + '" contenteditable="' + (kind === "md" ? "true" : "plaintext-only") + '" spellcheck="false"' +
      ' data-p="' + esc(path) + '" data-kind="' + kind + '" data-ph="' + esc(opts.ph || "입력") + '">' + html + "</span>";
  }
  // 보기 모드에서만 링크, 편집 모드에선 그냥 상자 (글자를 눌러도 이동하지 않게)
  function A(href, inner, cls, ext) {
    if (editing) return '<div class="' + (cls || "") + ' is-editing">' + inner + "</div>";
    return '<a class="' + (cls || "") + '" href="' + esc(href) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + inner + "</a>";
  }
  function del(path) {
    return editing ? '<button type="button" class="ed-del" data-del="' + esc(path) + '" aria-label="삭제" title="삭제">×</button>' : "";
  }
  function add(path, tpl, label) {
    return editing ? '<button type="button" class="ed-add" data-add="' + esc(path) + '" data-tpl="' + tpl + '">+ ' + esc(label || "추가") + "</button>" : "";
  }
  var TPL = {
    str: function () { return "새 항목"; },
    dayItem: function () { return { time: "", text: "새 일정" }; },
    check: function () { return { id: "c" + Date.now(), text: "새 할 일" }; },
    fact: function () { return { k: "항목", v: "내용", s: "" }; },
    deadline: function () { return { at: "2026-12-25T12:00:00+01:00", title: "새 일정", tab: "home" }; },
    section: function () { return { h: "새 섹션", list: ["내용"] }; },
    link: function () { return { label: "링크 이름", href: "https://" }; },
    cost: function () { return { name: "새 항목", sub: "", krw: 0, nok: null, status: "", tab: "cost" }; },
    pick: function () { return { name: "새 장소", desc: "설명", time: "" }; },
    extra: function () { return { k: "항목", v: "내용" }; },
    bd: function () { return { k: "항목", v: 0 }; },
    stay: function () { return { tab: "home", dates: "날짜", nights: 1, name: "숙소 이름", area: "위치", label: "STAY" }; },
    ref: function () { return { k: "링크", v: "이름", href: "https://" }; }
  };

  /* ---------- 지도 ---------- */
  function mapSrc(m) {
    // 저장해 둔 경로: 출발 → 경유지들 → 도착 (좌표 그대로)
    if (m.stops && m.stops.length > 1) {
      var pts = m.stops.map(function (s) { return s.at; });
      return "https://www.google.com/maps?saddr=" + encodeURIComponent(pts[0]) +
        "&daddr=" + encodeURIComponent(pts.slice(1).join(" to:")) + "&dirflg=d&hl=ko&output=embed";
    }
    if (m.from) return "https://www.google.com/maps?saddr=" + encodeURIComponent(m.from) + "&daddr=" + encodeURIComponent(m.to) + "&hl=ko&output=embed";
    return "https://www.google.com/maps?q=" + encodeURIComponent(m.q) + "&hl=ko&z=13&output=embed";
  }
  function mapOpenHref(m) {
    if (m.open) return m.open;
    if (m.from) return "https://www.google.com/maps/dir/?api=1&origin=" + encodeURIComponent(m.from) + "&destination=" + encodeURIComponent(m.to);
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(m.q);
  }
  function mapBlock(m, open) {
    if (!m.q && !m.from && !m.stops) return "";
    var route = m.stops ? '<p class="map-route">' + m.stops.map(function (s) { return esc(s.name); }).join(' <i>→</i> ') + "</p>" : "";
    return '<details class="map"' + (open ? " open" : "") + ">" +
      '<summary><span class="map-ic" aria-hidden="true"></span>' + esc(m.label || "지도") + '<span class="map-toggle">지도</span></summary>' + route +
      '<div class="map-frame"><iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="' + esc(m.label || "지도") + '" data-src="' + esc(mapSrc(m)) + '"></iframe></div>' +
      '<a class="map-open" href="' + esc(mapOpenHref(m)) + '" target="_blank" rel="noopener">' + esc(m.openLabel || "구글맵에서 열기") + " ↗</a></details>" +
      // 인쇄·PDF 에서는 지도 대신 글자로: 이름 · 경로(또는 장소) · 구글맵 링크
      '<p class="map-print">📍 <b>' + esc(m.label || "지도") + "</b> — " +
      esc(m.stops ? m.stops.map(function (s) { return s.name; }).join(" → ") : (m.from ? m.from + " → " + m.to : m.q)) +
      ' · <a href="' + esc(mapOpenHref(m)) + '">구글맵에서 열기</a></p>';
  }
  function wireMaps(root) {
    root.querySelectorAll("details.map").forEach(function (d) {
      function load() { var f = d.querySelector("iframe"); if (f && !f.src) f.src = f.getAttribute("data-src"); }
      if (d.open) load();
      d.addEventListener("toggle", function () { if (d.open) load(); });
    });
  }

  /* =========================================================
     공통 블록
     ========================================================= */
  var BACK = '<a class="back" href="#home">← 일정으로</a>';
  function head(p) {
    return BACK + '<header class="sec-head"><p class="eyebrow">' + E(p + ".eyebrow", { plain: true }) + "</p>" +
      '<h2 class="sec-title">' + E(p + ".title", { plain: true }) + "</h2>" +
      '<p class="sec-sub">' + E(p + ".original", { plain: true, ph: "부제" }) + "</p>" + refs(p + ".refs") + "</header>";
  }
  function staticHead(eyebrow, title, sub) {
    return BACK + '<header class="sec-head"><p class="eyebrow">' + esc(eyebrow) + '</p><h2 class="sec-title">' + esc(title) + "</h2>" +
      (sub ? '<p class="sec-sub">' + esc(sub) + "</p>" : "") + "</header>";
  }
  // 제목 아래 한 줄 링크: "여행사  Wandering Owl AS ↗"
  function refs(p) {
    var arr = getPath(D(), p) || [];
    if (!arr.length && !editing) return "";
    return '<div class="refs">' + arr.map(function (r, i) {
      var rp = p + "." + i;
      if (editing) {
        return '<div class="ref"><span class="ref-k">' + E(rp + ".k", { plain: true }) + "</span><span>" + E(rp + ".v", { plain: true }) +
          ' <span class="ref-h">' + E(rp + ".href", { plain: true, ph: "https://" }) + "</span></span>" + del(rp) + "</div>";
      }
      return '<div class="ref"><span class="ref-k">' + esc(r.k) + '</span><a href="' + esc(r.href) + '" target="_blank" rel="noopener">' + esc(r.v) + " ↗</a></div>";
    }).join("") + add(p, "ref", "링크 추가") + "</div>";
  }
  function contactHref(s) {
    if (/@/.test(s)) return "mailto:" + s.trim().split(/\s/)[0];
    var num = s.replace(/\(.*?\)/g, "").replace(/[^\d+]/g, "");
    return num.length >= 7 ? "tel:" + num : null;
  }
  function contacts(p) {
    var arr = getPath(D(), p) || [];
    if (!arr.length && !editing) return "";
    if (editing) return '<section class="block"><h3 class="block-h">연락처</h3>' + strList(p) + "</section>";
    return '<section class="block"><h3 class="block-h">연락처</h3><ul class="contacts">' + arr.map(function (c) {
      var h = contactHref(c);
      return "<li>" + (h ? '<a href="' + esc(h) + '">' + esc(c) + "</a>" : esc(c)) + "</li>";
    }).join("") + "</ul></section>";
  }
  function facts(p) {
    var list = getPath(D(), p) || [];
    return '<div class="facts">' + list.map(function (f, i) {
      var fp = p + "." + i;
      return '<div class="fact' + (f.muted ? " is-muted" : "") + '">' + del(fp) +
        '<span class="fact-k">' + E(fp + ".k", { plain: true }) + "</span>" +
        '<span class="fact-v">' + E(fp + ".v", { plain: true }) +
        (f.copy && !editing ? ' <button class="copy" data-copy="' + esc(f.v) + '" aria-label="복사">복사</button>' : "") + "</span>" +
        ((f.s || editing) ? '<span class="fact-s">' + E(fp + ".s", { plain: true, ph: "보조 설명 (선택)" }) + "</span>" : "") +
        "</div>";
    }).join("") + "</div>" + (editing ? '<div class="ed-row">' + add(p, "fact", "정보 칸 추가") + "</div>" : "");
  }
  function callout(p, tone) {
    var w = getPath(D(), p);
    if (!w) return "";
    return '<aside class="callout ' + (w.tone || tone || "warn") + '"><p class="callout-h">' + E(p + ".title", { plain: true }) + "</p><ul>" +
      w.items.map(function (_, i) { return "<li>" + E(p + ".items." + i) + del(p + ".items." + i) + "</li>"; }).join("") + "</ul>" +
      add(p + ".items", "str", "줄 추가") +
      (w.cta && !editing ? '<a class="btn" href="' + esc(w.cta.href) + '" target="_blank" rel="noopener">' + esc(w.cta.label) + " ↗</a>" : "") +
      "</aside>";
  }
  function strList(p, cls) {
    var arr = getPath(D(), p) || [];
    return '<ul class="' + (cls || "list") + '">' + arr.map(function (_, i) {
      return "<li>" + E(p + "." + i) + del(p + "." + i) + "</li>";
    }).join("") + "</ul>" + add(p, "str", "줄 추가");
  }
  function section(p) {
    var s = getPath(D(), p);
    var body = "";
    if (s.list) body += strList(p + ".list");
    if (s.chips) body += '<div class="chips">' + s.chips.map(function (_, i) {
      return "<span>" + E(p + ".chips." + i, { plain: true }) + del(p + ".chips." + i) + "</span>";
    }).join("") + add(p + ".chips", "str", "추가") + "</div>";
    if (s.recycle) body += '<div class="recycle">' + s.recycle.map(function (r, i) {
      var rp = p + ".recycle." + i;
      return '<div class="bin"><i style="background:' + esc(r.color) + '"></i><b>' + E(rp + ".label", { plain: true }) + "</b><span>" + E(rp + ".what", { plain: true }) + "</span></div>";
    }).join("") + "</div>" + ((s.note || editing) ? '<p class="note">' + E(p + ".note", { plain: true, ph: "메모 (선택)" }) + "</p>" : "");
    if (s.details) body += '<details class="more"' + (editing ? " open" : "") + "><summary>전체 목록 보기</summary>" + strList(p + ".details") + "</details>";
    return '<section class="block">' + del(p) + '<h3 class="block-h">' + E(p + ".h", { plain: true }) + "</h3>" + body + "</section>";
  }
  function addressBlock(p) {
    var d = getPath(D(), p);
    return '<section class="block"><h3 class="block-h">위치</h3><p class="addr">' + E(p + ".address", { plain: true }) + "</p>" +
      (editing ? '<p class="ed-hint">지도 검색어: ' + E(p + ".mapQ", { plain: true, ph: "주소 또는 장소명" }) + "</p>" : "") +
      mapBlock({ label: "지도 보기", q: d.mapQ, open: d.mapOpen }, !editing) + "</section>";
  }

  /* =========================================================
     화면별 내용
     ========================================================= */
  function viewHome() {
    var T = D();
    var dd = daysUntil(T.start);
    var ddText = dd > 0 ? "D-" + dd : dd === 0 ? "D-DAY" : "여행 중";
    var h = "";

    h += '<section class="intro"><div class="stats">' +
      '<div class="stat"><span class="stat-v serif">' + ddText + '</span><span class="stat-k">출발까지</span></div>' +
      '<div class="stat"><span class="stat-v serif">8박</span><span class="stat-k">12/24 – 1/1</span></div>' +
      '<div class="stat"><span class="stat-v serif">' + T.stays.length + '</span><span class="stat-k">숙소</span></div>' +
      '<div class="stat"><span class="stat-v serif">' + esc(T.travelers) + '</span><span class="stat-k">여행자</span></div>' +
      "</div></section>";

    h += '<section class="block"><p class="eyebrow">STAY</p><h3 class="block-h big">숙소 ' + T.stays.length + '곳</h3><div class="stay-cards">' +
      T.stays.map(function (s, i) {
        var p = "stays." + i;
        return A("#" + s.tab,
          del(p) + '<span class="stay-no serif">0' + (i + 1) + "</span>" +
          '<span class="stay-label">' + E(p + ".label", { plain: true }) + " · " + E(p + ".nights", { plain: true, kind: "num" }) + "박</span>" +
          '<span class="stay-dates">' + E(p + ".dates", { plain: true }) + "</span>" +
          '<span class="stay-name">' + E(p + ".name", { plain: true }) + "</span>" +
          '<span class="stay-area">' + E(p + ".area", { plain: true }) + "</span>", "stay-card");
      }).join("") + "</div></section>";

    h += '<section class="block"><p class="eyebrow">ITINERARY</p><h3 class="block-h big">일자별 일정</h3><ol class="days">';
    T.days.forEach(function (d, di) {
      var dt = new Date(d.date + "T12:00:00Z"), dp = "days." + di;
      h += '<li class="day tone-' + esc(d.tone) + '">' +
        '<div class="day-date"><span class="day-num serif">' + dt.getUTCDate() + "</span>" +
        '<span class="day-mon">' + MON[dt.getUTCMonth()] + " · " + WEEK[dt.getUTCDay()] + "</span></div>" +
        '<div class="day-body"><span class="tag">' + E(dp + ".tag", { plain: true }) + "</span><ul>" +
        d.items.map(function (it, ii) {
          var ip = dp + ".items." + ii;
          var inner = ((it.time || editing) ? '<span class="time">' + E(ip + ".time", { plain: true, ph: "시간" }) + "</span>" : "") +
            '<span class="txt">' + E(ip + ".text") + "</span>";
          if (editing) return '<li><span class="row">' + inner + del(ip) + "</span></li>";
          return "<li>" + (it.tab ? '<a href="#' + esc(it.tab) + '">' + inner + '<span class="go">›</span></a>' : '<span class="row">' + inner + "</span>") + "</li>";
        }).join("") + "</ul>" + add(dp + ".items", "dayItem", "일정 추가") +
        (d.maps && !editing ? d.maps.map(function (m) { return mapBlock(m, false); }).join("") : "") +
        (d.quote != null ? '<blockquote class="quote">' + E(dp + ".quote", { plain: true, ph: "메모" }) + "</blockquote>" : "") +
        "</div></li>";
    });
    h += "</ol></section>";

    var done = store("tt-check") || {};
    h += '<section class="block"><p class="eyebrow">BEFORE YOU GO</p><h3 class="block-h big">출발 전 체크리스트</h3><ul class="checks">' +
      T.checklist.map(function (c, i) {
        var p = "checklist." + i;
        if (editing) return '<li><div class="check-ed"><input type="checkbox" disabled><span>' + E(p + ".text", { plain: true }) + "</span>" + del(p) + "</div></li>";
        return '<li><label><input type="checkbox" data-id="' + esc(c.id) + '"' + (done[c.id] ? " checked" : "") + ">" +
          "<span>" + esc(c.text) + (c.link ? ' <a href="' + esc(c.link) + '" target="_blank" rel="noopener">링크 ↗</a>' : "") + "</span></label></li>";
      }).join("") + "</ul>" + add("checklist", "check", "할 일 추가") +
      '<p class="note">체크 표시는 이 기기에만 저장돼요.</p></section>';

    // 마감 일정: 보기 모드에선 지나간 것 빼고 시간순, 편집 모드에선 전체
    var rows = T.deadlines.map(function (x, i) { return { x: x, i: i }; });
    if (!editing) rows = rows.filter(function (r) { return new Date(r.x.at) > new Date(); })
      .sort(function (a, b) { return new Date(a.x.at) - new Date(b.x.at); });
    if (rows.length || editing) {
      h += '<section class="block"><p class="eyebrow">KEY DATES</p><h3 class="block-h big">놓치면 안 되는 시간</h3><ol class="deadlines">' +
        rows.map(function (r) {
          var p = "deadlines." + r.i, rel = relLabel(r.x.at);
          return '<li class="' + (r.x.urgent ? "urgent" : "") + '">' + A("#" + r.x.tab,
            '<span class="dl-when">' + (editing ? E(p + ".at", { kind: "dt", ph: "2026-12-25 17:30" }) : (r.x.dateOnly ? fmtDate(r.x.at) : fmtLocal(r.x.at))) + "</span>" +
            '<span class="dl-what">' + E(p + ".title", { plain: true }) + "</span>" +
            '<span class="dl-rel ' + rel.cls + '">' + (editing ? del(p) : rel.t) + "</span>") + "</li>";
        }).join("") + "</ol>" + add("deadlines", "deadline", "시간 추가") +
        '<p class="note">시간은 모두 노르웨이 현지 기준 (한국보다 8시간 늦음)' + (editing ? " · 형식: 2026-12-25 17:30" : "") + "</p></section>";
    }

    return h;
  }

  function viewCost() {
    var T = D();
    var items = T.cost.items;
    var known = items.filter(function (i) { return i.krw; });
    var total = known.reduce(function (s, i) { return s + Number(i.krw); }, 0);
    var STATUS = { paid: ["결제 완료", "ok"], due: ["결제 예정", "pend"], onsite: ["현지 결제", "pend"], self: ["개별 예약", "tbd"], tbd: ["추가 예정", "tbd"], "": ["상태 미기재", "none"] };
    var n = Number(T.travelers) || 1;

    var h = staticHead("COST", "비용 상세", "환율 변경에 따라 약간 변동 가능");
    h += '<div class="total per-person"><div><span class="total-k">1인당 (확정분)</span><span class="total-v serif">' + krw(total / n) + "</span></div>" +
      '<div><span class="total-k">총 비용 · ' + n + '명</span><span class="total-v small">' + krw(total) + "</span></div></div>";

    h += '<ul class="cost-list">' + items.map(function (it, i) {
      var p = "cost.items." + i, st = STATUS[it.status] || STATUS[""];
      var badge = editing
        ? '<select class="ed-select" data-p="' + p + '.status">' + Object.keys(STATUS).map(function (k) {
            return '<option value="' + k + '"' + (it.status === k ? " selected" : "") + ">" + STATUS[k][0] + "</option>";
          }).join("") + "</select>"
        : '<span class="badge ' + st[1] + '">' + (it.status === "due" && it.due ? esc(it.due) + " " : "") + st[0] + "</span>";
      var inner = del(p) +
        '<div class="cost-top"><span class="cost-name">' + E(p + ".name", { plain: true }) + " <em>" + E(p + ".sub", { plain: true, ph: "업체" }) + "</em></span>" + badge + "</div>" +
        '<div class="cost-rows">' +
        '<div class="cost-cell main"><span>1인 (' + n + '명)</span><b>' + (it.krw ? krw(it.krw / n) : "—") + "</b>" +
        (it.nok ? "<em>" + nok(Math.round(it.nok / n * 100) / 100) + "</em>" : "") + "</div>" +
        '<div class="cost-cell sub"><span>총액</span><b>' + (editing ? "₩ " + E(p + ".krw", { kind: "num", plain: true, ph: "원화" }) : (it.krw ? krw(it.krw) : "—")) + "</b>" +
        (editing ? "<em>" + E(p + ".nok", { kind: "num", plain: true, ph: "NOK" }) + " NOK</em>" : (it.nok ? "<em>" + nok(it.nok) + "</em>" : "")) + "</div></div>";
      return "<li>" + A("#" + it.tab, inner) + "</li>";
    }).join("") + "</ul>" + add("cost.items", "cost", "비용 항목 추가");
    h += '<p class="note">' + (editing ? "금액은 숫자만 입력 (쉼표는 자동 처리). 합계는 저장 후 다시 계산돼요." : "MOXY는 각자 개별 예약이라 합계에서 빠져 있어요. 렌터카는 픽업 시 현지에서 결제해요.") + "</p>";
    return h;
  }

  function viewDetail(key, extra) {
    var d = D()[key];
    var h = head(key);
    h += facts(key + ".facts");
    h += callout(key + ".warn");
    if (extra) h += extra;
    h += addressBlock(key);
    h += contacts(key + ".contacts");
    (d.sections || []).forEach(function (_, i) { h += section(key + ".sections." + i); });
    if (editing) h += '<div class="ed-row">' + add(key + ".sections", "section", "섹션 추가") + "</div>";
    return h;
  }

  function cancelBlock(p) {
    var cb = getPath(D(), p);
    var days = Math.floor((new Date(cb.checkin) - new Date()) / 86400000);
    var activeIdx = cb.bands.findIndex(function (b) { return days >= b.minDays; });
    return '<section class="block"><h3 class="block-h">취소 · 환불 <span class="muted">오늘 기준 체크인 ' + Math.max(days, 0) + "일 전</span></h3>" +
      '<ol class="bands">' + cb.bands.map(function (b, i) {
        return '<li class="' + (i === activeIdx ? "on" : i < activeIdx ? "gone" : "") + '">' + E(p + ".bands." + i + ".text", { plain: true }) +
          (i === activeIdx ? '<span class="now">현재</span>' : "") + "</li>";
      }).join("") + '</ol><p class="note">' + E(p + ".note", { plain: true }) + "</p></section>";
  }

  function breakdownBlock(p) {
    var rows = getPath(D(), p);
    var max = Math.max.apply(null, rows.map(function (r) { return Number(r.v) || 0; }).concat([1]));
    var sum = rows.reduce(function (s, r) { return s + (Number(r.v) || 0); }, 0);
    return '<section class="block"><h3 class="block-h">요금 내역 <span class="muted">합계 ' + nok(sum) + "</span></h3>" +
      '<ul class="breakdown">' + rows.map(function (r, i) {
        var rp = p + "." + i;
        return '<li><span class="bd-k">' + E(rp + ".k", { plain: true }) + del(rp) + '</span><span class="bd-v">' +
          (editing ? E(rp + ".v", { kind: "num", plain: true }) + " NOK" : nok(r.v)) + "</span>" +
          '<span class="bar"><i style="width:' + ((Number(r.v) || 0) / max * 100).toFixed(1) + '%"></i></span></li>';
      }).join("") + "</ul>" + add(p, "bd", "요금 항목 추가") + "</section>";
  }

  function viewPicks() {
    var P = D().picks;
    var h = staticHead("PICKS", "트롬쇠 여행 추천", "노션 「트롬쇠 여행 추천 사항 (by ChatGPT)」 정리");
    P.groups.forEach(function (g, gi) {
      var gp = "picks.groups." + gi;
      h += '<section class="block"><p class="stars" aria-label="별 ' + g.stars + '개">' + "★★★★★".slice(0, g.stars) + "<span>" + "★★★★★".slice(g.stars) + "</span></p>" +
        '<h3 class="block-h big">' + E(gp + ".title", { plain: true }) + '</h3><div class="picks">';
      g.items.forEach(function (it, ii) {
        var ip = gp + ".items." + ii;
        h += '<article class="pick">' + del(ip);
        if (it.imgs && it.imgs.length) {
          h += '<div class="pick-imgs n' + it.imgs.length + '">' + it.imgs.map(function (f) {
            return '<a href="' + esc(wmPage(f)) + '" target="_blank" rel="noopener" title="Wikimedia Commons"><img src="' + esc(wm(f, 640)) + '" alt="' + esc(it.name) + '" loading="lazy"></a>';
          }).join("") + "</div>";
        }
        h += '<div class="pick-body"><h4>' + E(ip + ".name", { plain: true }) +
          ((it.time || editing) ? ' <span class="pick-time">' + E(ip + ".time", { plain: true, ph: "소요 시간" }) + "</span>" : "") + "</h4>" +
          "<p>" + E(ip + ".desc", { plain: true }) + "</p>" +
          (it.link && !editing ? '<a class="muted-link" href="' + esc(it.link.href) + '" target="_blank" rel="noopener">' + esc(it.link.label) + " ↗</a>" : "") +
          "</div></article>";
      });
      h += "</div>" + add(gp + ".items", "pick", "장소 추가") + "</section>";
    });
    h += '<section class="block"><p class="stars">★★★<span>★★</span></p><h3 class="block-h big">그 밖에</h3><dl class="extras">' +
      P.extras.map(function (_, i) {
        var ep = "picks.extras." + i;
        return "<div><dt>" + E(ep + ".k", { plain: true }) + del(ep) + "</dt><dd>" + E(ep + ".v", { plain: true }) + "</dd></div>";
      }).join("") + "</dl>" + add("picks.extras", "extra", "추가") + "</section>";
    h += '<aside class="callout info"><p class="callout-h">한 줄 정리</p><p>' + E("picks.summary", { plain: true }) + "</p></aside>";
    h += '<p class="note">사진: Wikimedia Commons (CC BY / CC BY-SA) — 사진을 누르면 원본 및 작가 정보로 이동</p>';
    return h;
  }

  /* =========================================================
     전체 지도 (오픈스트리트맵 · Leaflet) — 탭을 열 때만 불러온다
     ========================================================= */
  var MAP_POINTS = [
    { id: "stay1", kind: "stay", n: "1", name: "숙소 1 · 12/25–28", sub: "Dramsvegen 167", at: [69.6715376, 18.9654358], tab: "stay1" },
    { id: "stay2", kind: "stay", n: "2", name: "숙소 2 · 12/28–30", sub: "Lauklines Kystferie 캐빈", at: [69.6209136, 18.285743], tab: "stay2" },
    { id: "stay3", kind: "stay", n: "3", name: "숙소 3 · 12/30–1/1", sub: "MOXY Tromsø (공항 옆)", q: "Huldervegen 2, 9016 Tromsø, Norway", near: [69.6812, 18.9225], tab: "stay3" },
    { id: "airport", kind: "place", n: "✈", name: "트롬쇠 공항", sub: "렌터카 픽업 12/25 · 반납 12/30", at: [69.683333, 18.918919], tab: "car" },
    { id: "aurora", kind: "place", n: "★", name: "오로라 투어 집결지", sub: "Scandic Ishavshotel 앞 · 12/26 17:20", at: [69.649595612, 18.961887359], tab: "aurora" },
    { id: "sommaroy", kind: "place", n: "◆", name: "Sommarøy", sub: "12/29 드라이브", at: [69.635942, 18.004582] }
  ];
  var MAP_ROUTES = [
    { name: "12/25 공항 → 숙소 1", color: "#2f6fde", pts: [[69.683333, 18.918919], [69.6715376, 18.9654358]] },
    { name: "12/28 해안 드라이브 → 캐빈", color: "#d97706", pts: [[69.6715376, 18.9654358], [69.6942065, 18.6203726], [69.7774907, 18.5398493], [69.7795494, 18.3999063], [69.6209136, 18.285743]] },
    { name: "12/29 캐빈 → Sommarøy", color: "#db2777", pts: [[69.6209136, 18.285743], [69.635942, 18.004582]] },
    { name: "12/30 캐빈 → 공항 (렌터카 반납)", color: "#7c3aed", pts: [[69.6209136, 18.285743], [69.683333, 18.918919]] }
  ];

  function viewMap() {
    var h = staticHead("MAP", "전체 지도", "숙소 3곳과 이동 경로를 한 장에");
    h += '<div class="bigmap-wrap"><div id="bigmap" class="bigmap"><p class="bigmap-msg">지도를 불러오는 중…</p></div></div>';
    h += '<section class="block"><h3 class="block-h">장소</h3><ul class="legend">' + MAP_POINTS.map(function (pt) {
      return '<li><button type="button" class="legend-item" data-pt="' + pt.id + '"><span class="pin pin-' + pt.kind + '">' + esc(pt.n) + "</span>" +
        '<span class="legend-txt"><b>' + esc(pt.name) + "</b><small>" + esc(pt.sub) + "</small></span></button></li>";
    }).join("") + "</ul></section>";
    h += '<section class="block"><h3 class="block-h">이동 경로</h3><ul class="legend">' + MAP_ROUTES.map(function (r, i) {
      return '<li><button type="button" class="legend-item" data-route="' + i + '"><span class="route-sw" style="background:' + r.color + '"></span>' +
        '<span class="legend-txt"><b>' + esc(r.name) + "</b></span></button></li>";
    }).join("") + '</ul><p class="note">지도는 OpenStreetMap · 경로는 OSRM 계산 결과예요. 계산이 안 되면 점선으로 표시돼요. 지도는 인터넷이 연결돼 있어야 보여요.</p></section>';
    setTimeout(initBigMap, 0);
    return h;
  }

  var leafletLoading = null, bigMap = null, mapLayers = {};
  function loadLeaflet() {
    if (window.L) return Promise.resolve();
    if (leafletLoading) return leafletLoading;
    leafletLoading = new Promise(function (resolve, reject) {
      var css = document.createElement("link");
      css.rel = "stylesheet"; css.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(css);
      var js = document.createElement("script");
      js.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      js.onload = function () { resolve(); };
      js.onerror = function () { leafletLoading = null; reject(new Error("leaflet")); };
      document.head.appendChild(js);
    });
    return leafletLoading;
  }
  function geocode(pt) {   // 좌표를 모르는 곳만 주소로 찾고, 찾은 값은 이 기기에 기억
    if (pt.at) return Promise.resolve(pt.at);
    var key = "tt-geo-" + pt.id, hit = store(key);
    if (hit) { pt.at = hit; return Promise.resolve(hit); }
    return fetch("https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + encodeURIComponent(pt.q))
      .then(function (r) { return r.json(); })
      .then(function (j) { var at = j && j[0] ? [Number(j[0].lat), Number(j[0].lon)] : pt.near; pt.at = at; if (j && j[0]) store(key, at); return at; })
      .catch(function () { pt.at = pt.near; return pt.near; });
  }
  function routeGeometry(r) {   // OSRM 으로 실제 도로 경로 (이 기기에 기억)
    var key = "tt-route-" + r.pts.map(function (p) { return p.join(","); }).join(";"), hit = store(key);
    if (hit) return Promise.resolve(hit);
    var coords = r.pts.map(function (p) { return p[1] + "," + p[0]; }).join(";");
    return fetch("https://router.project-osrm.org/route/v1/driving/" + coords + "?overview=full&geometries=geojson")
      .then(function (res) { return res.json(); })
      .then(function (j) {
        if (!j.routes || !j.routes[0]) throw new Error("no route");
        var line = j.routes[0].geometry.coordinates.map(function (c) { return [c[1], c[0]]; });
        store(key, line);
        return line;
      });
  }
  function initBigMap() {
    var el = document.getElementById("bigmap");
    if (!el) return;
    loadLeaflet().then(function () {
      if (!document.getElementById("bigmap")) return;
      el.innerHTML = "";
      var L = window.L;
      bigMap = L.map(el, { zoomControl: true, attributionControl: true, scrollWheelZoom: false });
      // OpenStreetMap 기본 타일 (API 키 불필요, 출처 표기 필수)
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
      }).addTo(bigMap);
      mapLayers = { pts: {}, routes: {} };
      var bounds = L.latLngBounds([]);
      MAP_ROUTES.forEach(function (r, i) {
        r.pts.forEach(function (p) { bounds.extend(p); });
        var dashed = L.polyline(r.pts, { color: r.color, weight: 3, opacity: .7, dashArray: "6 8" }).addTo(bigMap);
        mapLayers.routes[i] = dashed;
        routeGeometry(r).then(function (line) {
          if (!bigMap) return;
          bigMap.removeLayer(dashed);
          mapLayers.routes[i] = L.polyline(line, { color: r.color, weight: 4, opacity: .85 }).addTo(bigMap).bindTooltip(r.name);
        }).catch(function () { dashed.bindTooltip(r.name + " (대략적인 선)"); });
      });
      Promise.all(MAP_POINTS.map(geocode)).then(function () {
        if (!bigMap) return;
        MAP_POINTS.forEach(function (pt) {
          if (!pt.at) return;
          bounds.extend(pt.at);
          var icon = L.divIcon({ className: "", html: '<span class="pin pin-' + pt.kind + '">' + esc(pt.n) + "</span>", iconSize: [28, 28], iconAnchor: [14, 14] });
          var gm = "https://www.google.com/maps/search/?api=1&query=" + pt.at[0] + "," + pt.at[1];
          var pop = "<b>" + esc(pt.name) + "</b><br><small>" + esc(pt.sub) + '</small><div class="pop-links">' +
            (pt.tab ? '<a href="#' + pt.tab + '">자세히 보기</a>' : "") + '<a href="' + gm + '" target="_blank" rel="noopener">구글맵 ↗</a></div>';
          mapLayers.pts[pt.id] = L.marker(pt.at, { icon: icon }).addTo(bigMap).bindPopup(pop);
        });
        bigMap.fitBounds(bounds, { padding: [24, 24] });
      });
      bigMap.fitBounds(bounds, { padding: [24, 24] });
    }).catch(function () {
      el.innerHTML = '<p class="bigmap-msg">지도를 불러오지 못했어요. 인터넷 연결을 확인해 주세요.</p>';
    });
  }
  app.addEventListener("click", function (e) {
    var it = e.target.closest(".legend-item");
    if (!it || !bigMap) return;
    var id = it.getAttribute("data-pt"), ri = it.getAttribute("data-route");
    if (id && mapLayers.pts[id]) { bigMap.flyTo(mapLayers.pts[id].getLatLng(), 13, { duration: .6 }); mapLayers.pts[id].openPopup(); }
    if (ri != null && mapLayers.routes[ri]) bigMap.flyToBounds(mapLayers.routes[ri].getBounds(), { padding: [30, 30], duration: .6 });
    var wrap = document.querySelector(".bigmap-wrap");
    if (wrap) { var y = wrap.getBoundingClientRect().top + window.scrollY - 110; if (window.scrollY > y) window.scrollTo(0, y); }
  });

  function viewInfo() {
    var d = D().info;
    if (!d) return staticHead("LOCAL INFO", "추가 정보", "준비 중이에요");
    var h = head("info");
    if (d.notice || editing) h = h.replace(BACK, BACK + '<p class="info-notice">🔄 ' + E("info.notice", { plain: true, ph: "안내 문구" }) + "</p>");
    h += callout("info.warn");
    (d.sections || []).forEach(function (_, i) { h += section("info.sections." + i); });
    if (editing) h += '<div class="ed-row">' + add("info.sections", "section", "섹션 추가") + "</div>";
    h += '<section class="block"><h3 class="block-h">유용한 링크</h3>' + refs("info.links") + "</section>";
    return h;
  }

  var VIEWS = {
    home: viewHome,
    cost: viewCost,
    stay1: function () { return viewDetail("stay1"); },
    stay2: function () { return viewDetail("stay2", cancelBlock("stay2.cancelBands")); },
    stay3: function () { return viewDetail("stay3"); },
    aurora: function () { return viewDetail("aurora"); },
    car: function () { return viewDetail("car", breakdownBlock("car.breakdown")); },
    picks: viewPicks,
    map: viewMap,
    info: viewInfo
  };

  /* =========================================================
     렌더 · 라우터
     ========================================================= */
  var tabsEl = document.querySelector("#tabs .tabs-inner");
  // 메인 '일정' 탭: 오로라 색 지붕 + 작은 별이 달린 집 아이콘, 뒤에 얇은 구분선
  var HOME_IC = '<svg class="home-ic" viewBox="0 0 20 20" aria-hidden="true">' +
    '<defs><linearGradient id="homeG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4fd6a2"/><stop offset="1" stop-color="#8b7bf0"/></linearGradient></defs>' +
    '<path d="M3.2 9.2 10 3.6l6.8 5.6" fill="none" stroke="url(#homeG)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M5 8.6V16a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8.6" fill="url(#homeG)" opacity=".22"/>' +
    '<path d="M5 8.6V16a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8.6" fill="none" stroke="url(#homeG)" stroke-width="1.8" stroke-linejoin="round"/>' +
    '<rect x="8.4" y="11.6" width="3.2" height="5.4" rx="1.4" fill="url(#homeG)"/>' +
    '<path class="home-star" d="M16.2 1.2l.55 1.25 1.25.55-1.25.55-.55 1.25-.55-1.25-1.25-.55 1.25-.55z" fill="#ffcf4a"/></svg>';
  function renderTabs() {
    var info = D().info;
    tabsEl.innerHTML = TABS.map(function (t) {
      var home = t.id === "home";
      var badge = t.id === "info" && info && info.draft ? '<span class="tab-badge">작성 중</span>' : "";
      return '<a role="tab" href="#' + t.id + '" data-tab="' + t.id + '"' + (home ? ' class="tab-home"' : "") + ">" +
        (home ? HOME_IC : "") + esc(t.label) + badge + "</a>" + (home ? '<span class="tab-sep" aria-hidden="true"></span>' : "");
    }).join("");
  }
  renderTabs();

  function current() {
    var id = (location.hash || "#home").slice(1);
    return VIEWS[id] ? id : "home";
  }
  /* ---------- 접히는 상단 ----------
     사진은 페이지와 함께 스크롤되고, 스크롤 위치(0 → 접히는 거리)에 맞춰 여기서 직접 그린다.
     - 제목: 위로 떠오르며 작아지고, 흐려지면서 오로라 빛깔로 물들어 사라짐
     - 사진은 점점 어두워지고, 오로라는 화면에 머물며 따라 내려옴
     - 다 접히면 오로라 빛 작은 제목 줄 + 탭이 맨 위에 남음
     흐림(blur)은 무거워서 아이패드·앱 안 브라우저·움직임 줄이기 설정에서는 뺀다 */
  var heroEl = document.getElementById("hero");
  var barEl = document.getElementById("topbar");
  var H = {
    inner: heroEl.querySelector(".hero-inner"),
    ghost: null,
    glow: heroEl.querySelector(".hero-glow"),
    shade: heroEl.querySelector(".hero-shade"),
    aurora: heroEl.querySelector(".aurora"),
    mini: barEl.querySelector(".mini")
  };
  var MINI = 48;          // 접혔을 때 남는 작은 제목 줄
  var collapseY = 0;
  var ticking = false;
  var scrollTimer = null;
  var lastP = -1;
  var HV = (document.documentElement.className.match(/\bhv-([abcd])\b/) || [])[1] || ""; // 상단 시안 비교용
  var REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var LITE = REDUCED || ENV_LITE();
  function ENV_LITE() {
    var ua = navigator.userAgent || "";
    var ipad = /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    var inApp = /KAKAOTALK|NAVER\(inapp|Instagram|FBAN|FBAV|FB_IAB|Line\/|DaumApps|everytimeApp|; wv\)/i.test(ua);
    return ipad || inApp;
  }
  // 흐린 제목 사본: 흐림은 한 번만 그려 두고, 스크롤 중에는 선명한 제목과 투명도만 맞바꾼다
  // (흐림 값을 매번 바꾸면 Safari 가 글자를 계속 다시 그려 버벅인다)
  if (!LITE && !HV) {
    H.ghost = document.createElement("div");
    H.ghost.className = "hero-inner hero-ghost";
    H.ghost.setAttribute("aria-hidden", "true");
    H.inner.parentNode.insertBefore(H.ghost, H.inner.nextSibling);
  }
  function syncGhost() {
    if (!H.ghost) return;
    H.ghost.innerHTML = H.inner.innerHTML;
    H.ghost.querySelectorAll("*").forEach(function (el) {
      el.removeAttribute("id"); el.removeAttribute("contenteditable"); el.removeAttribute("tabindex");
      el.classList.remove("ed");
    });
  }
  // 구간별 직선 보간: stops = [[진행도, 값], ...]
  function seg(p, stops) {
    if (p <= stops[0][0]) return stops[0][1];
    for (var i = 1; i < stops.length; i++) {
      if (p <= stops[i][0]) {
        var a = stops[i - 1], b = stops[i];
        return a[1] + (b[1] - a[1]) * (p - a[0]) / (b[0] - a[0]);
      }
    }
    return stops[stops.length - 1][1];
  }
  function paintHero(p) {
    if (HV) return; // 시안은 스크롤 계산 효과 없음 (작은 제목 줄은 CSS 클래스로)
    p = Math.round(p * 1000) / 1000;
    if (p === lastP) return;
    lastP = p;
    // 위치·크기는 건드리지 않는다: 스크립트는 스크롤보다 한 박자 늦어서 움직임을 넣으면 덕덕 끊겨 보인다.
    // 움직임은 스크롤 그대로(브라우저가 부드럽게 처리), 여기서는 투명도만 바꾼다.
    if (H.ghost) {
      H.inner.style.opacity = seg(p, [[0.25, 1], [0.75, 0]]).toFixed(3);
      H.ghost.style.opacity = seg(p, [[0.2, 0], [0.6, 0.85], [0.8, 0.7], [1, 0]]).toFixed(3);
    } else {
      H.inner.style.opacity = seg(p, [[0.45, 1], [0.8, 0.7], [1, 0]]).toFixed(3);
    }
    H.glow.style.opacity = seg(p, [[0, 0], [0.4, 0.35], [0.75, 0.95], [1, 1]]).toFixed(3);
    H.shade.style.opacity = (0.92 * p).toFixed(3);
    H.aurora.style.opacity = (1 - 0.45 * p).toFixed(3);
    H.mini.style.opacity = seg(p, [[0.65, 0], [1, 1]]).toFixed(3);
  }
  function layoutTop() {
    collapseY = Math.max(heroEl.offsetHeight - MINI, 0);
    lastP = -1;
    onScroll();
  }
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    paintHero(collapseY ? Math.min(Math.max(y / collapseY, 0), 1) : 1);
    var on = y >= collapseY - (HV ? 30 : 1);
    if (barEl.classList.contains("stuck") !== on) barEl.classList.toggle("stuck", on);
  }
  window.addEventListener("scroll", function () {
    // 스크롤하는 동안만 오로라 흔들림을 멈춘다 (클래스는 스크롤 시작·끝에 한 번씩만 바뀜)
    if (!scrollTimer) document.documentElement.classList.add("scrolling");
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () { scrollTimer = null; document.documentElement.classList.remove("scrolling"); }, 180);
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener("resize", layoutTop);
  layoutTop();
  document.getElementById("heroCue").addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({ top: collapseY, behavior: "smooth" });
  });

  function renderHero() {
    var T = D();
    var meta = document.getElementById("heroMeta");
    meta.innerHTML = E("period", { plain: true });
    var cm = document.getElementById("coverMeta");
    if (cm) cm.textContent = meta.textContent;
    syncGhost();
  }
  function render(scroll) {
    var id = current();
    document.body.setAttribute("data-tab", id);
    document.body.classList.toggle("editing", editing);
    renderHero();
    var slide = swipeDir ? " slide-" + swipeDir : "";
    swipeDir = null;
    if (bigMap) { try { bigMap.remove(); } catch (e) { /* 무시 */ } bigMap = null; }
    app.innerHTML = '<div class="view view-' + id + slide + '">' + VIEWS[id]() + "</div>";
    var sl = tabsEl.scrollLeft; renderTabs(); tabsEl.scrollLeft = sl;
    tabsEl.querySelectorAll("a").forEach(function (a) {
      var on = a.getAttribute("data-tab") === id;
      a.classList.toggle("on", on);
      a.setAttribute("aria-selected", on ? "true" : "false");
      if (on) {
        var box = tabsEl.getBoundingClientRect(), r = a.getBoundingClientRect();
        if (r.left < box.left || r.right > box.right) tabsEl.scrollLeft += (r.left - box.left) - 16;
      }
    });
    wireMaps(app);
    renderBar();
    if (scroll) {
      // 탭을 바꾸면 그 탭의 맨 위(접힌 상단 바로 아래)에서 시작
      // 새 탭은 맨 위에서 바로 시작 — 부드러운 스크롤 애니메이션 없이 순간 이동
      if (window.scrollY > collapseY || HV === "b") {
        var html = document.documentElement, prev = html.style.scrollBehavior;
        html.style.scrollBehavior = "auto";
        window.scrollTo(0, collapseY);
        html.style.scrollBehavior = prev;
      }
    }
  }
  window.addEventListener("hashchange", function () { render(true); });

  /* ---------- 좌우 스와이프로 탭 이동 (터치 기기) ----------
     - 옆으로 60px 이상, 세로보다 1.5배 이상 옆으로 움직였을 때만
     - 화면 가장자리(뒤로 가기 제스처), 지도·탭 바·편집 중에는 동작 안 함 */
  var swipeDir = null;
  var sw = null;
  var EDGE = 24, MIN_DX = 60;
  app.addEventListener("touchstart", function (e) {
    sw = null;
    if (editing || e.touches.length !== 1) return;
    var t = e.touches[0];
    if (t.clientX < EDGE || t.clientX > window.innerWidth - EDGE) return;
    if (e.target.closest("details.map, iframe, .leaflet-container, .ed, input, select, textarea, .modal, .history")) return;
    sw = { x: t.clientX, y: t.clientY, dir: null };
  }, { passive: true });
  app.addEventListener("touchmove", function (e) {
    if (!sw || sw.dir) return;
    var t = e.touches[0], dx = t.clientX - sw.x, dy = t.clientY - sw.y;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    sw.dir = Math.abs(dx) > Math.abs(dy) * 1.5 ? "h" : "v";
  }, { passive: true });
  app.addEventListener("touchend", function (e) {
    if (!sw || sw.dir !== "h") { sw = null; return; }
    var t = e.changedTouches[0], dx = t.clientX - sw.x, dy = t.clientY - sw.y;
    sw = null;
    if (Math.abs(dx) < MIN_DX || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    var idx = TABS.findIndex(function (x) { return x.id === current(); });
    var next = idx + (dx < 0 ? 1 : -1);
    if (next < 0 || next >= TABS.length) return;   // 처음·마지막 탭에서는 그대로
    swipeDir = dx < 0 ? "next" : "prev";
    location.hash = TABS[next].id;
  }, { passive: true });

  /* =========================================================
     편집: 입력 · 추가 · 삭제
     ========================================================= */
  function markDirty() { dirty = true; renderBar(); }

  document.addEventListener("input", function (e) {
    var el = e.target.closest && e.target.closest(".ed");
    if (!el || !editing) return;
    var kind = el.getAttribute("data-kind"), txt = el.textContent.replace(/ /g, " ");
    var val = txt;
    if (kind === "md") {
      val = toMd(el);
    } else if (kind === "num") {
      var cleaned = txt.replace(/[^\d.\-]/g, "");
      val = cleaned === "" ? null : Number(cleaned);
      if (cleaned !== "" && isNaN(val)) return;
    } else if (kind === "dt") {
      val = inputToIso(txt);
      el.classList.toggle("ed-bad", !val);
      if (!val) return; // 형식이 맞을 때만 반영
    }
    setPath(WORK, el.getAttribute("data-p"), val);
    markDirty();
  });
  // 굵은 글씨가 섞인 편집 칸 → **굵게** 표기로
  function toMd(el) {
    function walk(node) {
      var out = "";
      node.childNodes.forEach(function (n) {
        if (n.nodeType === 3) { out += n.nodeValue; return; }
        if (n.nodeType !== 1) return;
        if (n.tagName === "BR") { out += " "; return; }
        var inner = walk(n);
        var fw = n.style && n.style.fontWeight;
        var bold = n.tagName === "B" || n.tagName === "STRONG" || fw === "bold" || Number(fw) >= 600;
        out += bold && inner.trim() ? "**" + inner + "**" : inner;
      });
      return out;
    }
    return walk(el).replace(/\u00a0/g, " ").replace(/\*\*\*\*/g, "").replace(/\*\*(\s*)\*\*/g, "$1");
  }
  // B 버튼: 굵게 가능한 칸에 커서가 있을 때만 켜진다
  var boldReady = false;
  document.addEventListener("focusin", function (e) {
    var on = !!(editing && e.target.closest && e.target.closest('.ed[data-kind="md"]'));
    if (on !== boldReady) { boldReady = on; syncBold(); }
  });
  document.addEventListener("focusout", function () {
    setTimeout(function () {
      var a = document.activeElement;
      var on = !!(editing && a && a.closest && a.closest('.ed[data-kind="md"]'));
      if (on !== boldReady) { boldReady = on; syncBold(); }
    }, 0);
  });
  function syncBold() {
    var b = bar.querySelector('[data-act="bold"]');
    if (b) b.disabled = !boldReady;
  }

  // 편집 칸에서 Enter = 줄바꿈 대신 다음 칸으로
  document.addEventListener("keydown", function (e) {
    var el = e.target.closest && e.target.closest(".ed");
    if (!el || e.key !== "Enter" || e.isComposing) return;
    e.preventDefault();
    el.blur();
  });
  // 붙여넣기는 글자만
  document.addEventListener("paste", function (e) {
    var el = e.target.closest && e.target.closest(".ed");
    if (!el) return;
    e.preventDefault();
    var t = (e.clipboardData || window.clipboardData).getData("text").replace(/\s*\n\s*/g, " ");
    document.execCommand("insertText", false, t);
  });

  app.addEventListener("change", function (e) {
    var t = e.target;
    if (t.matches(".checks input[type=checkbox]") && !editing) {
      var s = store("tt-check") || {};
      s[t.getAttribute("data-id")] = t.checked;
      store("tt-check", s);
    }
    if (t.matches(".ed-select") && editing) {
      setPath(WORK, t.getAttribute("data-p"), t.value);
      markDirty();
      render(false);
    }
  });

  app.addEventListener("click", function (e) {
    var b = e.target.closest(".copy");
    if (b) {
      var v = b.getAttribute("data-copy");
      if (navigator.clipboard) navigator.clipboard.writeText(v).then(function () {
        b.textContent = "복사됨"; setTimeout(function () { b.textContent = "복사"; }, 1400);
      }, function () {});
      return;
    }
    if (!editing) return;
    var addBtn = e.target.closest(".ed-add");
    if (addBtn) {
      e.preventDefault();
      var p = addBtn.getAttribute("data-add");
      var arr = getPath(WORK, p);
      if (!Array.isArray(arr)) { arr = []; setPath(WORK, p, arr); }
      arr.push(TPL[addBtn.getAttribute("data-tpl")]());
      markDirty();
      render(false);
      var eds = app.querySelectorAll('.ed[data-p^="' + p + "." + (arr.length - 1) + '"]');
      if (eds.length) focusEnd(eds[eds.length - 1]);
      return;
    }
    var delBtn = e.target.closest(".ed-del");
    if (delBtn) {
      e.preventDefault();
      var dp = delBtn.getAttribute("data-del");
      var ks = dp.split("."), idx = Number(ks.pop());
      getPath(WORK, ks.join(".")).splice(idx, 1);
      markDirty();
      render(false);
      toast("삭제했어요 · 저장 전이면 「취소」로 되돌릴 수 있어요");
    }
  });
  function focusEnd(el) {
    el.focus();
    try {
      var r = document.createRange(); r.selectNodeContents(el);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    } catch (e) { /* ignore */ }
  }

  window.addEventListener("beforeunload", function (e) {
    if (editing && dirty) { e.preventDefault(); e.returnValue = ""; }
  });

  /* =========================================================
     편집 바 · 대화상자 · 서버 통신
     ========================================================= */
  var bar = document.createElement("div");
  bar.className = "edit-bar";
  document.body.appendChild(bar);

  function renderBar() {
    if (!editing) {
      bar.innerHTML = "";   // 편집 버튼은 페이지 맨 아래(footer)에 있다
      return;
    }
    bar.innerHTML = '<div class="bar-in"><span class="bar-state ' + (dirty ? "dirty" : "") + '">' +
      (dirty ? "저장 안 된 변경 있음" : "편집 중 · 글자를 눌러 수정") + "</span>" +
      '<button type="button" class="bold-btn" data-act="bold" title="굵게 (글자를 선택한 뒤)"' + (boldReady ? "" : " disabled") + '><b>B</b></button>' +
      '<button type="button" data-act="history">이력</button>' +
      '<button type="button" data-act="cancel">취소</button>' +
      '<button type="button" class="primary" data-act="save"' + (dirty ? "" : " disabled") + ">저장</button></div>";
  }

  document.getElementById("footEdit").addEventListener("click", function () { if (!editing) startEdit(); });

  // B 버튼을 눌러도 편집 칸의 선택이 풀리지 않게
  bar.addEventListener("pointerdown", function (e) {
    if (e.target.closest('[data-act="bold"]')) e.preventDefault();
  });
  bar.addEventListener("mousedown", function (e) {
    if (e.target.closest('[data-act="bold"]')) e.preventDefault();
  });

  bar.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-act]");
    if (!b) return;
    var act = b.getAttribute("data-act");
    if (act === "edit") startEdit();
    if (act === "cancel") cancelEdit();
    if (act === "save") save(false);
    if (act === "history") openHistory();
    if (act === "bold") {
      var a = document.activeElement;
      if (!a || !a.closest || !a.closest('.ed[data-kind="md"]')) return toast("굵게 할 글자를 먼저 선택해 주세요");
      try { document.execCommand("styleWithCSS", false, false); } catch (err) { /* 무시 */ }
      document.execCommand("bold", false, null);
      a.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });

  function api(method, url, body) {
    return fetch(url, {
      method: method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
      credentials: "same-origin",
      cache: "no-store"
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { j._status = r.status; return j; });
    });
  }

  function toast(msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add("out"); }, 2200);
    setTimeout(function () { t.remove(); }, 2700);
  }

  // 간단한 대화상자: buttons = [{label, value, primary}]
  function dialog(title, bodyHtml, buttons) {
    return new Promise(function (resolve) {
      var wrap = document.createElement("div");
      wrap.className = "modal";
      wrap.innerHTML = '<div class="modal-box" role="dialog" aria-modal="true"><h3>' + esc(title) + "</h3>" +
        '<div class="modal-body">' + bodyHtml + '</div><div class="modal-btns">' +
        buttons.map(function (b, i) { return '<button type="button" data-i="' + i + '" class="' + (b.primary ? "primary" : "") + '">' + esc(b.label) + "</button>"; }).join("") +
        "</div></div>";
      document.body.appendChild(wrap);
      function close(v) { wrap.remove(); resolve(v); }
      wrap.addEventListener("click", function (e) {
        if (e.target === wrap) return close(null);
        var btn = e.target.closest("button[data-i]");
        if (btn) {
          var b = buttons[Number(btn.getAttribute("data-i"))];
          if (b.value === "__form") {
            var data = {};
            wrap.querySelectorAll("input[name]").forEach(function (i) { data[i.name] = i.value; });
            return close(data);
          }
          close(b.value);
        }
      });
      wrap.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && e.target.matches("input")) {
          e.preventDefault();
          var p = wrap.querySelector("button.primary"); if (p) p.click();
        }
      });
      var first = wrap.querySelector("input"); if (first) setTimeout(function () { first.focus(); }, 30);
      wrap.__resolve = close;
      dialog.last = wrap;
    });
  }

  function startEdit() {
    api("GET", "/api/edit").then(function (s) {
      if (s._status !== 200) return dialog("편집할 수 없어요", "<p>서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.</p>", [{ label: "닫기", value: null, primary: true }]);
      if (!s.storage) return dialog("저장소 연결이 필요해요", "<p>Vercel 프로젝트 → <b>Storage → Create → Blob</b>으로 저장소를 만들고 이 프로젝트에 연결한 뒤 다시 배포해 주세요.</p>", [{ label: "닫기", value: null, primary: true }]);
      if (!s.configured) return dialog("편집 비밀번호가 설정되지 않았어요", "<p>Vercel 프로젝트 → <b>Settings → Environment Variables</b>에 <code>EDIT_PASSWORD</code>를 추가하고 다시 배포해 주세요.</p>", [{ label: "닫기", value: null, primary: true }]);
      if (s.canEdit) return enterEdit();
      return askEditLogin();
    }).catch(function () {
      dialog("편집할 수 없어요", "<p>네트워크를 확인해 주세요.</p>", [{ label: "닫기", value: null, primary: true }]);
    });
  }

  function askEditLogin(errMsg) {
    var savedName = store("tt-name") || "";
    return dialog("편집 모드",
      (errMsg ? '<p class="modal-err">' + esc(errMsg) + "</p>" : "") +
      '<label class="field"><span>편집 비밀번호</span><input name="pw" type="password" autocomplete="off" inputmode="text"></label>' +
      '<label class="field"><span>이름 <em>(변경 이력에 표시)</em></span><input name="name" type="text" maxlength="20" value="' + esc(savedName) + '" placeholder="예: 승민"></label>',
      [{ label: "취소", value: null }, { label: "편집 시작", value: "__form", primary: true }]
    ).then(function (f) {
      if (!f) return;
      store("tt-name", f.name || "");
      return api("POST", "/api/edit", { pw: f.pw, name: f.name }).then(function (r) {
        if (r._status === 200) return enterEdit();
        return askEditLogin(r._status === 401 ? "비밀번호가 맞지 않아요" : "다시 시도해 주세요");
      });
    });
  }

  function enterEdit() {
    // 다른 사람이 그 사이 고쳤을 수 있으니 최신 내용으로 시작
    return loadLatest(true).then(function () {
      WORK = clone(DOC);
      editing = true;
      dirty = false;
      render(false);
      toast("편집 모드 · 글자를 눌러 고치고 「저장」");
    });
  }

  function cancelEdit() {
    var go = dirty
      ? dialog("변경 내용을 버릴까요?", "<p>저장하지 않은 수정은 사라져요.</p>", [{ label: "계속 편집", value: false }, { label: "버리기", value: true, primary: true }])
      : Promise.resolve(true);
    go.then(function (ok) {
      if (!ok) return;
      editing = false; dirty = false; WORK = null;
      render(false);
    });
  }

  function save(force) {
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    var bad = app.querySelector(".ed-bad");
    if (bad) {
      bad.scrollIntoView({ block: "center" });
      return dialog("날짜 형식을 확인해 주세요", "<p>날짜는 <b>2026-12-25 17:30</b> 형식으로 입력해 주세요.</p>", [{ label: "확인", value: null, primary: true }]);
    }
    var body = { doc: WORK, base: VERSION, force: !!force };
    if (!VERSION) body.seed = DEFAULT;
    bar.querySelector(".primary") && (bar.querySelector(".primary").disabled = true);
    return api("PUT", "/api/data", body).then(function (r) {
      if (r._status === 200) {
        DOC = clone(WORK); VERSION = r.version;
        editing = false; dirty = false; WORK = null;
        render(false);
        toast("저장했어요");
        return;
      }
      renderBar();
      if (r._status === 409) {
        var who = (r.meta && r.meta.editor) || "다른 사람";
        var when = r.meta && r.meta.at ? new Date(r.meta.at).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
        return dialog("먼저 저장된 내용이 있어요",
          "<p><b>" + esc(who) + "</b>님이 " + esc(when) + "에 먼저 저장했어요.</p><p>덮어쓰면 그 수정은 사라져요. 단, 변경 이력에는 남아서 나중에 되돌릴 수 있어요.</p>",
          [{ label: "계속 편집", value: "stay" }, { label: "최신 내용 불러오기", value: "reload" }, { label: "내 수정으로 덮어쓰기", value: "force", primary: true }]
        ).then(function (v) {
          if (v === "force") return save(true);
          if (v === "reload") { dirty = false; return enterEdit(); }
        });
      }
      if (r._status === 403) return askEditLogin("편집 로그인이 만료됐어요. 다시 입력해 주세요");
      return dialog("저장하지 못했어요", "<p>잠시 후 다시 시도해 주세요." + (r.detail ? "<br><small>" + esc(r.detail) + "</small>" : "") + "</p>", [{ label: "확인", value: null, primary: true }]);
    }).catch(function () {
      renderBar();
      dialog("저장하지 못했어요", "<p>네트워크를 확인하고 다시 저장해 주세요. 수정 내용은 화면에 그대로 있어요.</p>", [{ label: "확인", value: null, primary: true }]);
    });
  }

  function openHistory() {
    api("GET", "/api/history").then(function (r) {
      if (r._status !== 200) return dialog("이력을 불러오지 못했어요", "<p>잠시 후 다시 시도해 주세요.</p>", [{ label: "닫기", value: null, primary: true }]);
      if (!r.items.length) return dialog("변경 이력", "<p>아직 저장된 이력이 없어요. 처음 저장하면 원본(data.js)과 함께 기록돼요.</p>", [{ label: "닫기", value: null, primary: true }]);
      var rows = r.items.map(function (it, i) {
        var when = new Date(Number(it.id)).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
        return '<li><div><b>' + esc(when) + "</b> · " + esc(it.editor || "") + (it.note ? '<br><small>' + esc(it.note) + "</small>" : "") + "</div>" +
          (i === 0 ? '<span class="cur">현재</span>' : '<button type="button" class="restore" data-id="' + esc(it.id) + '">되돌리기</button>') + "</li>";
      }).join("");
      var p = dialog("변경 이력", '<ul class="history">' + rows + "</ul>" +
        (dirty ? '<p class="modal-err">되돌리면 지금 저장 안 된 수정은 사라져요.</p>' : ""), [{ label: "닫기", value: null, primary: true }]);
      var modal = dialog.last;
      modal.addEventListener("click", function (e) {
        var btn = e.target.closest(".restore");
        if (!btn) return;
        btn.disabled = true; btn.textContent = "되돌리는 중…";
        api("POST", "/api/history", { restore: btn.getAttribute("data-id") }).then(function (res) {
          if (res._status !== 200) { btn.textContent = "실패"; return; }
          DOC = res.doc; VERSION = res.version; WORK = clone(DOC); dirty = false;
          modal.__resolve(null);
          render(false);
          toast("이전 버전으로 되돌렸어요");
        });
      });
      return p;
    });
  }

  /* =========================================================
     시작: 서버에 저장된 최신 내용 불러오기
     ========================================================= */
  /* ---------- 이미 저장된 내용에 코드 쪽 문구 변경 반영 ----------
     편집으로 바꾼 값은 건드리지 않고, 원래 문구 그대로인 곳만 바꾼다. */
  var PATCHES = [{ id: "2026-11-24-content", ops: [
    { p: "stays.0.name", from: "전망 좋은 모던 아파트", to: "Tromsø 시내에서 약간 떨어진 주택" },
    { p: "stay1.title", from: "전망 좋은 모던 아파트", to: "Tromsø 시내에서 약간 떨어진 주택" },
    { p: "stay1.facts.3.s", from: "1인 ₩745,885", to: "1인 ₩745,885 · 12/16 결제 예정" },
    { p: "cost.items.0.status", from: "", to: "due" },
    { p: "cost.items.0.due", from: undefined, to: "12/16" },
    { p: "cost.items.4.status", from: "tbd", to: "self" },
    { p: "checklist.6.text", from: "MOXY 예약 정보(예약번호·비용) 페이지에 추가", to: "MOXY 각자 개별 예약 확인" },
    { p: "stay3.facts.2", fromK: "추가 예정", to: { k: "예약", v: "개별 예약", s: "각자 예약 · 각자 결제" } },
    { p: "stay3.facts.3", fromK: "추가 예정", to: { k: "총 비용", v: "각자 결제", muted: true, s: "공동 비용 합계에서 제외" } },
    { p: "stay3.warn", fromTitle: "예약 확정", to: { title: "개별 예약", tone: "info", items: ["3번째 숙소는 **MOXY로 확정 · 각자 개별 예약**", "공항 바로 옆이라 12/30 렌터카 반납 후 이동, 1/1 출국이 편해요"] } },
    { p: "stay2.warn", fromTitle: "체크인 준비물", to: null, moveToSection: { h: "체크인 안내", list: ["파손 보증(가승인)용 **신용카드 지참** — Visa / Mastercard / Eurocard (퇴실 시 이상 없으면 해제)", "첫날 **22:00 전 도착** 및 리셉션 연락"] } },
    { addDeadline: { at: "2026-12-16T12:00:00+09:00", title: "Airbnb 숙박비 결제 예정", tab: "stay1", dateOnly: true } }
  ]}, { id: "2026-11-24-info", ops: [
    { p: "info.draft", from: true, to: false },
    { p: "info.title", from: "현지 정보", to: "추가 정보" },
    { p: "info.notice", from: undefined, to: "확인하면서 계속 업데이트 합니다" }
  ]}];
  function migrate(doc) {
    // 새로 생긴 큰 항목(예: 현지 정보)은 저장본에 없으면 기본값을 붙인다
    Object.keys(DEFAULT).forEach(function (k) { if (k !== "_patches" && !(k in doc)) doc[k] = clone(DEFAULT[k]); });
    doc._patches = doc._patches || [];
    PATCHES.forEach(function (patch) {
      if (doc._patches.indexOf(patch.id) >= 0) return;
      patch.ops.forEach(function (op) {
        try {
          if (op.addDeadline) {
            if (!doc.deadlines.some(function (d) { return d.title === op.addDeadline.title; })) doc.deadlines.unshift(clone(op.addDeadline));
            return;
          }
          var cur = getPath(doc, op.p);
          var match = ("from" in op && cur === op.from) ||
            (op.fromK && cur && cur.v === op.fromK) ||
            (op.fromTitle && cur && cur.title === op.fromTitle);
          if (!match) return;
          setPath(doc, op.p, op.to == null ? undefined : clone(op.to));
          if (op.moveToSection && doc.stay2 && doc.stay2.sections) doc.stay2.sections.unshift(clone(op.moveToSection));
        } catch (e) { /* 구조가 바뀐 곳은 건너뜀 */ }
      });
      doc._patches.push(patch.id);
    });
    return doc;
  }
  DEFAULT._patches = PATCHES.map(function (x) { return x.id; });
  DOC._patches = DEFAULT._patches.slice();

  function loadLatest(fresh) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 4000);
    return fetch("/api/data" + (fresh ? "?fresh=1" : ""), { cache: "no-store", credentials: "same-origin", signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { setOffline(!!r.headers.get("x-tt-offline")); return r.ok ? r.json() : null; })
      .then(function (j) {
        if (j && j.doc) { DOC = migrate(j.doc); VERSION = j.version; }
        else if (j && j.storage && !j.doc) { VERSION = null; }
      })
      .catch(function () { setOffline(!navigator.onLine); /* 서버 없으면 data.js 그대로 */ })
      .then(function () { clearTimeout(timer); });
  }

  /* ---------- 홈 화면에 추가 (하단 버튼) ----------
     안드로이드: 브라우저가 "설치 가능" 신호를 주면 휴대폰 설치 창
     아이폰·아이패드: 순서 안내 · 카카오톡 등 앱 안 브라우저: 인터넷 앱으로 열기 안내 */
  var UA = navigator.userAgent || "";
  var ENV = {
    kakao: /KAKAOTALK/i.test(UA),
    inApp: /KAKAOTALK|NAVER\(inapp|Instagram|FBAN|FBAV|FB_IAB|Line\/|DaumApps|BAND\/|everytimeApp|; wv\)/i.test(UA),
    ios: /iPhone|iPad|iPod/.test(UA) || (/Macintosh/.test(UA) && navigator.maxTouchPoints > 1),
    android: /Android/i.test(UA),
    standalone: (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true
  };
  var installEvt = null;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); installEvt = e; });
  window.addEventListener("appinstalled", function () { toast("홈 화면에 추가됐어요"); });
  var a2hsBtn = document.getElementById("footA2hs");
  if (ENV.standalone) a2hsBtn.hidden = true;

  var IC_DOTS = '<svg width="28" height="28" viewBox="0 0 24 24" fill="#2f6fde"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>';
  var IC_SHARE = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2f6fde" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
  var IC_ADD = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#15171c" stroke-width="2" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
  var IC_VDOTS = '<svg width="28" height="28" viewBox="0 0 24 24" fill="#15171c"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>';
  function step(n, html, icon) {
    return '<div class="a2-step"><span class="a2-no">' + n + '</span><span class="a2-txt">' + html + '</span><span class="a2-ic">' + icon + "</span></div>";
  }
  var SWITCH = '<p class="a2-switch">다른 휴대폰 안내 보기: <button type="button" data-a2="ios">아이폰</button> · <button type="button" data-a2="android">안드로이드</button></p>';
  function a2Content(kind) {
    if (kind === "printapp") {
      var url2 = "kakaotalk://web/openExternal?url=" + encodeURIComponent(location.origin + "/");
      return "<h3>" + (ENV.kakao ? "카카오톡" : "이 앱") + "에서는 PDF 저장이 안 돼요</h3><p class=\"a2-sub\">인터넷 앱으로 열어서 다시 눌러 주세요</p>" +
        (ENV.kakao ? '<a class="a2-big" href="' + url2 + '">인터넷 앱으로 열기</a>' : "") +
        '<p class="a2-small">' + (ENV.kakao ? "버튼이 안 되면: " : "") + "오른쪽 위 <b>⋮</b> (또는 아래 <b>⋯</b>) → <b>다른 브라우저로 열기</b>. 열린 뒤 맨 아래 <b>🖨️ PDF·인쇄</b>를 누르면 돼요.</p>";
    }
    if (kind === "inapp") {
      var url = "kakaotalk://web/openExternal?url=" + encodeURIComponent(location.origin + "/");
      return "<h3>" + (ENV.kakao ? "카카오톡" : "이 앱") + "에서는 추가할 수 없어요</h3><p class=\"a2-sub\">먼저 인터넷 앱으로 열어 주세요</p>" +
        (ENV.kakao ? '<a class="a2-big" href="' + url + '">인터넷 앱으로 열기</a><p class="a2-note">아이폰은 Safari, 안드로이드는 평소 쓰는 인터넷 앱(Chrome·삼성 인터넷)으로 열려요</p>' : "") +
        '<p class="a2-small">' + (ENV.kakao ? "버튼이 안 되면: " : "") + "오른쪽 위 <b>⋮</b> (또는 아래 <b>⋯</b>) → <b>다른 브라우저로 열기</b>를 눌러 주세요. 열린 뒤 맨 아래 <b>📲 홈 화면에 추가</b>를 다시 누르면 돼요.</p>";
    }
    if (kind === "android") {
      return "<h3>홈 화면에 추가하는 방법</h3><p class=\"a2-sub\">안드로이드 (Chrome · 삼성 인터넷)</p>" +
        step(1, "오른쪽 위(삼성 인터넷은 아래) <b>⋮ 또는 ≡ 메뉴</b>를 눌러요", IC_VDOTS) +
        step(2, "<b>홈 화면에 추가</b> 또는 <b>앱 설치</b>를 눌러요", IC_ADD) +
        step(3, "<b>추가(설치)</b>를 누르면 끝!<br>홈 화면에 오로라 아이콘이 생겨요", IC_ADD) + SWITCH;
    }
    return "<h3>홈 화면에 추가하는 방법</h3><p class=\"a2-sub\">아이폰 · 아이패드 (Safari)</p>" +
      step(1, "화면 아래쪽(또는 위쪽)의 <b>⋯ 버튼</b>이나 <b>공유 버튼</b>을 눌러요", IC_DOTS) +
      step(2, "<b>공유</b>를 누르고, 목록을 내려 <b>홈 화면에 추가</b>를 눌러요", IC_SHARE) +
      step(3, "오른쪽 위 <b>추가</b>를 누르면 끝!<br>홈 화면에 오로라 아이콘이 생겨요", IC_ADD) + SWITCH;
  }
  function openA2Sheet(kind) {
    var old = document.querySelector(".a2-wrap"); if (old) old.remove();
    var wrap = document.createElement("div");
    wrap.className = "a2-wrap";
    wrap.innerHTML = '<div class="a2-bg"></div><div class="a2-sheet" role="dialog" aria-modal="true"><div class="a2-grab"></div>' +
      a2Content(kind) + '<button type="button" class="a2-close">' + (kind === "inapp" || kind === "printapp" ? "닫기" : "알겠어요") + "</button></div>";
    document.body.appendChild(wrap);
    wrap.addEventListener("click", function (e) {
      if (e.target.classList.contains("a2-bg") || e.target.classList.contains("a2-close")) return wrap.remove();
      var sw = e.target.closest("[data-a2]");
      if (sw) openA2Sheet(sw.getAttribute("data-a2"));
    });
  }
  a2hsBtn.addEventListener("click", function () {
    if (ENV.inApp) return openA2Sheet("inapp");
    if (installEvt) {
      var evt = installEvt; installEvt = null;
      evt.prompt();
      if (evt.userChoice) evt.userChoice.then(function (c) { if (c.outcome !== "accepted") installEvt = null; });
      return;
    }
    openA2Sheet(ENV.ios ? "ios" : "android");
  });

  /* ---------- PDF·인쇄 (하단 버튼) ----------
     모든 탭(지도 탭 제외)을 한 문서로 이어 붙여 인쇄 창을 연다.
     아이폰: 인쇄 창 → 공유 → 파일에 저장 / 안드로이드·PC: 프린터에서 "PDF로 저장"
     브라우저 메뉴로 직접 인쇄해도(beforeprint) 같은 문서가 나온다 */
  var printDoc = document.getElementById("printDoc");
  function buildPrint() {
    var now = new Date();
    var stamp = now.getFullYear() + ". " + (now.getMonth() + 1) + ". " + now.getDate() + " 기준";
    var period = (document.getElementById("heroMeta") || {}).textContent || "";
    var html = '<section class="p-cover"><h1>Tromsø, Norway</h1><p class="p-lat">69° N</p><p class="p-period">' + esc(period) +
      '</p><p class="p-stamp">' + esc(stamp) + " · 최신 내용은 사이트에서 확인</p></section>";
    var wasEditing = editing; editing = false; // 편집 칸 표시 없이
    TABS.forEach(function (t) {
      if (t.id === "map") return;
      var body = "";
      try { body = VIEWS[t.id](); } catch (e) { body = "<p>(이 부분은 불러오지 못했어요)</p>"; }
      html += '<section class="p-sec"><p class="p-tab">' + esc(t.label) + '</p><div class="view view-' + t.id + '">' + body + "</div></section>";
    });
    editing = wasEditing;
    printDoc.innerHTML = html;
    printDoc.querySelectorAll("details").forEach(function (d) { d.open = true; });
    printDoc.querySelectorAll("iframe, .leaflet-container, .back, .ed-add, .ed-del").forEach(function (el) { el.remove(); });
    printDoc.querySelectorAll("[id]").forEach(function (el) { el.removeAttribute("id"); });
    printDoc.querySelectorAll("img").forEach(function (im) { im.removeAttribute("loading"); im.loading = "eager"; });
  }
  // 사진이 다 받아질 때까지(최대 3초) 기다렸다가 인쇄 창을 연다
  function imagesReady(ms) {
    var imgs = [].slice.call(printDoc.querySelectorAll("img")).filter(function (im) { return !im.complete; });
    if (!imgs.length) return Promise.resolve();
    return Promise.race([
      Promise.all(imgs.map(function (im) { return new Promise(function (r) { im.onload = im.onerror = r; }); })),
      new Promise(function (r) { setTimeout(r, ms); })
    ]);
  }
  window.addEventListener("beforeprint", buildPrint);
  document.getElementById("footPrint").addEventListener("click", function () {
    if (editing) return toast("편집을 저장하거나 취소한 뒤에 눌러 주세요");
    if (ENV.inApp || typeof window.print !== "function") return openA2Sheet("printapp");
    buildPrint();
    var btn = this; btn.disabled = true;
    imagesReady(3000).then(function () { btn.disabled = false; window.print(); });
  });

  /* ---------- 진단 창: 맨 아래 "Tromsø 2026" 을 5번 연속 누르면 ---------- */
  var APP_VERSION = "2026-11-25.p1";
  var brandTaps = [];
  document.getElementById("footBrand").addEventListener("click", function () {
    var now = Date.now();
    brandTaps = brandTaps.filter(function (t) { return now - t < 3000; });
    brandTaps.push(now);
    if (brandTaps.length >= 5) { brandTaps = []; showDiag(); }
  });
  function showDiag() {
    var hi = getComputedStyle(document.querySelector(".hero-inner"));
    var info = {
      "버전": APP_VERSION,
      "상단 시안": HV ? HV.toUpperCase() : "현재",
      "상단 효과": "스크립트" + (LITE ? " (흐림 없음)" : " (흐린 사본 겹치기)"),
      "현재 제목 상태": "선명 " + hi.opacity + " / 흐림 사본 " + (H.ghost ? getComputedStyle(H.ghost).opacity : "-"),
      "화면 폭×높이": innerWidth + "×" + innerHeight + " (dpr " + (window.devicePixelRatio || 1) + ")",
      "폭 700 이하": matchMedia("(max-width: 700px)").matches,
      "홈 화면 앱": ENV.standalone,
      "움직임 줄이기 설정": matchMedia("(prefers-reduced-motion: reduce)").matches,
      "앱 안 브라우저 판정": ENV.inApp,
      "아이폰/아이패드 판정": ENV.ios,
      "접히는 거리": collapseY + "px",
      "오프라인 도우미": navigator.serviceWorker && navigator.serviceWorker.controller ? "작동 중" : "없음",
      "브라우저 정보": UA
    };
    var text = Object.keys(info).map(function (k) { return k + ": " + info[k]; }).join("\n");
    dialog("진단 정보", '<pre class="diag">' + esc(text) + "</pre><p class=\"note\">이 화면을 캡처해서 보내 주세요</p>",
      [{ label: "복사", value: "copy" }, { label: "닫기", value: null, primary: true }]).then(function (v) {
      if (v === "copy" && navigator.clipboard) navigator.clipboard.writeText(text).then(function () { toast("복사했어요"); }, function () {});
    });
  }

  /* ---------- 오프라인 지원 ---------- */
  function setOffline(on) {
    var el = document.getElementById("offlineBar");
    if (el) el.hidden = !on;
  }
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("/sw.js").catch(function () {}); });
  }
  window.addEventListener("online", function () { if (!editing) loadLatest().then(function () { render(false); }); });
  window.addEventListener("offline", function () { setOffline(true); });
  // 로그아웃하면 이 기기에 저장해 둔 여행 내용도 지운다
  document.getElementById("logout").addEventListener("click", function (e) {
    if (!window.caches) return;
    e.preventDefault();
    var href = this.getAttribute("href");
    caches.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return caches.delete(k); })); })
      .catch(function () {}).then(function () { location.href = href; });
  });

  // 저장된 최신 내용을 받아서 그린다 (서버가 느리면 최대 4초 뒤 data.js 로)
  app.innerHTML = '<p class="loading">불러오는 중…</p>';
  loadLatest().then(function () { render(false); });
})();
