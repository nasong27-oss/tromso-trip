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
    { id: "cost", label: "비용 상세" },
    { id: "stay1", label: "12/25–28 숙소" },
    { id: "stay2", label: "12/28–30 숙소" },
    { id: "stay3", label: "12/30–1/1 숙소" },
    { id: "aurora", label: "오로라 투어" },
    { id: "car", label: "렌터카" },
    { id: "picks", label: "추천" }
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
    var kind = opts.kind || "text";
    var raw = kind === "dt" ? isoToInput(v) : (v == null ? "" : String(v));
    return '<span class="ed' + (opts.block ? " ed-block" : "") + '" contenteditable="plaintext-only" spellcheck="false"' +
      ' data-p="' + esc(path) + '" data-kind="' + kind + '" data-ph="' + esc(opts.ph || "입력") + '">' + esc(raw) + "</span>";
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
    if (m.from) return "https://www.google.com/maps?saddr=" + encodeURIComponent(m.from) + "&daddr=" + encodeURIComponent(m.to) + "&hl=ko&output=embed";
    return "https://www.google.com/maps?q=" + encodeURIComponent(m.q) + "&hl=ko&z=13&output=embed";
  }
  function mapOpenHref(m) {
    if (m.open) return m.open;
    if (m.from) return "https://www.google.com/maps/dir/?api=1&origin=" + encodeURIComponent(m.from) + "&destination=" + encodeURIComponent(m.to);
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(m.q);
  }
  function mapBlock(m, open) {
    if (!m.q && !m.from) return "";
    return '<details class="map"' + (open ? " open" : "") + ">" +
      '<summary><span class="map-ic" aria-hidden="true"></span>' + esc(m.label || "지도") + '<span class="map-toggle">지도</span></summary>' +
      '<div class="map-frame"><iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="' + esc(m.label || "지도") + '" data-src="' + esc(mapSrc(m)) + '"></iframe></div>' +
      '<a class="map-open" href="' + esc(mapOpenHref(m)) + '" target="_blank" rel="noopener">' + esc(m.openLabel || "구글맵에서 열기") + " ↗</a></details>";
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
            '<span class="dl-when">' + (editing ? E(p + ".at", { kind: "dt", ph: "2026-12-25 17:30" }) : fmtLocal(r.x.at)) + "</span>" +
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
    var STATUS = { paid: ["결제 완료", "ok"], onsite: ["현지 결제", "pend"], tbd: ["추가 예정", "tbd"], "": ["상태 미기재", "none"] };
    var n = Number(T.travelers) || 1;

    var h = staticHead("COST", "비용 상세", "엑셀 「비용 정리」 기준 · " + n + "명 균등 분담");
    h += '<div class="total"><div><span class="total-k">총 비용 (확정분)</span><span class="total-v serif">' + krw(total) + "</span></div>" +
      '<div><span class="total-k">1인당</span><span class="total-v serif">' + krw(total / n) + "</span></div></div>";

    h += '<ul class="cost-list">' + items.map(function (it, i) {
      var p = "cost.items." + i, st = STATUS[it.status] || STATUS[""];
      var badge = editing
        ? '<select class="ed-select" data-p="' + p + '.status">' + Object.keys(STATUS).map(function (k) {
            return '<option value="' + k + '"' + (it.status === k ? " selected" : "") + ">" + STATUS[k][0] + "</option>";
          }).join("") + "</select>"
        : '<span class="badge ' + st[1] + '">' + st[0] + "</span>";
      var inner = del(p) +
        '<div class="cost-top"><span class="cost-name">' + E(p + ".name", { plain: true }) + " <em>" + E(p + ".sub", { plain: true, ph: "업체" }) + "</em></span>" + badge + "</div>" +
        '<div class="cost-rows">' +
        '<div class="cost-cell"><span>총액</span><b>' + (editing ? "₩ " + E(p + ".krw", { kind: "num", plain: true, ph: "원화" }) : (it.krw ? krw(it.krw) : "—")) + "</b>" +
        (editing ? "<em>" + E(p + ".nok", { kind: "num", plain: true, ph: "NOK" }) + " NOK</em>" : (it.nok ? "<em>" + nok(it.nok) + "</em>" : "")) + "</div>" +
        '<div class="cost-cell"><span>1인 (' + n + '명)</span><b>' + (it.krw ? krw(it.krw / n) : "—") + "</b>" +
        (it.nok ? "<em>" + nok(Math.round(it.nok / n * 100) / 100) + "</em>" : "") + "</div></div>";
      return "<li>" + A("#" + it.tab, inner) + "</li>";
    }).join("") + "</ul>" + add("cost.items", "cost", "비용 항목 추가");
    h += '<p class="note">' + (editing ? "금액은 숫자만 입력 (쉼표는 자동 처리). 합계는 저장 후 다시 계산돼요." : "MOXY 숙박비는 확정되면 합계에 더해집니다. 렌터카는 픽업 시 현지에서 결제해요.") + "</p>";
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

  var VIEWS = {
    home: viewHome,
    cost: viewCost,
    stay1: function () { return viewDetail("stay1"); },
    stay2: function () { return viewDetail("stay2", cancelBlock("stay2.cancelBands")); },
    stay3: function () { return viewDetail("stay3"); },
    aurora: function () { return viewDetail("aurora"); },
    car: function () { return viewDetail("car", breakdownBlock("car.breakdown")); },
    picks: viewPicks
  };

  /* =========================================================
     렌더 · 라우터
     ========================================================= */
  var tabsEl = document.querySelector("#tabs .tabs-inner");
  tabsEl.innerHTML = TABS.map(function (t) {
    return '<a role="tab" href="#' + t.id + '" data-tab="' + t.id + '">' + esc(t.label) + "</a>";
  }).join("");

  function current() {
    var id = (location.hash || "#home").slice(1);
    return VIEWS[id] ? id : "home";
  }
  /* ---------- 접히는 상단: 사진 → 작은 제목 + 탭 ---------- */
  var topEl = document.getElementById("top");
  var heroEl = document.getElementById("hero");
  var MINI = 48;          // 접혔을 때 남는 제목 줄 높이
  var collapseY = 0;
  var ticking = false;
  function layoutTop() {
    collapseY = Math.max(heroEl.offsetHeight - MINI, 0);
    topEl.style.top = -collapseY + "px";   // sticky 가 이만큼 올라간 뒤 멈춘다
    onScroll();
  }
  function onScroll() {
    ticking = false;
    var p = collapseY ? Math.min(Math.max(window.scrollY / collapseY, 0), 1) : 0;
    topEl.style.setProperty("--p", p.toFixed(3));
    topEl.classList.toggle("collapsed", p >= 0.99);
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener("resize", layoutTop);
  layoutTop();

  function renderHero() {
    var T = D();
    var meta = document.getElementById("heroMeta");
    meta.innerHTML = E("period", { plain: true }) + " · " + esc(T.travelers) + "명";
    document.querySelector(".hero-img").style.backgroundImage = "url('" + T.heroImage + "')";
  }
  function render(scroll) {
    var id = current();
    document.body.classList.toggle("editing", editing);
    renderHero();
    app.innerHTML = '<div class="view view-' + id + '">' + VIEWS[id]() + "</div>";
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
      if (window.scrollY > collapseY) window.scrollTo(0, collapseY);
    }
  }
  window.addEventListener("hashchange", function () { render(true); });

  /* =========================================================
     편집: 입력 · 추가 · 삭제
     ========================================================= */
  function markDirty() { dirty = true; renderBar(); }

  document.addEventListener("input", function (e) {
    var el = e.target.closest && e.target.closest(".ed");
    if (!el || !editing) return;
    var kind = el.getAttribute("data-kind"), txt = el.textContent.replace(/ /g, " ");
    var val = txt;
    if (kind === "num") {
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
      bar.innerHTML = '<button type="button" class="fab" data-act="edit">✏️ 편집</button>';
      return;
    }
    bar.innerHTML = '<div class="bar-in"><span class="bar-state ' + (dirty ? "dirty" : "") + '">' +
      (dirty ? "저장 안 된 변경 있음" : "편집 중 · 글자를 눌러 수정") + "</span>" +
      '<button type="button" data-act="history">이력</button>' +
      '<button type="button" data-act="cancel">취소</button>' +
      '<button type="button" class="primary" data-act="save"' + (dirty ? "" : " disabled") + ">저장</button></div>";
  }

  bar.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-act]");
    if (!b) return;
    var act = b.getAttribute("data-act");
    if (act === "edit") startEdit();
    if (act === "cancel") cancelEdit();
    if (act === "save") save(false);
    if (act === "history") openHistory();
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
    return loadLatest().then(function () {
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
  function loadLatest() {
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 4000);
    return fetch("/api/data", { cache: "no-store", credentials: "same-origin", signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (j && j.doc) { DOC = j.doc; VERSION = j.version; }
        else if (j && j.storage && !j.doc) { VERSION = null; }
      })
      .catch(function () { /* 서버 없으면 data.js 그대로 */ })
      .then(function () { clearTimeout(timer); });
  }

  // 저장된 최신 내용을 받아서 그린다 (서버가 느리면 최대 4초 뒤 data.js 로)
  app.innerHTML = '<p class="loading">불러오는 중…</p>';
  loadLatest().then(function () { render(false); });
})();
