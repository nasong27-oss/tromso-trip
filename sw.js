/* 오프라인 지원 — 한 번 연 내용은 인터넷이 끊겨도 보이게
   - 페이지(/): 네트워크 우선, 안 되면 저장본
   - /assets/*: 네트워크 우선(4초) — 인터넷이 되면 항상 최신 파일, 끊겼을 때만 저장본
   - /api/data: 네트워크 우선(5초), 안 되면 마지막 저장본 (응답에 x-tt-offline 표시)
   - 글꼴: 한 번 받으면 저장본 사용
   - 지도·편집 요청은 저장하지 않음
   - 앱이 "prep" 메시지를 보내면 화면 · 내용 · 사진을 한 번에 저장 (오프라인 준비)
   - 기내 와이파이 안내 페이지 같은 엉뚱한 응답은 저장하지 않음 (valid) */
const VERSION = "tt-v2";
const SHELL = ["/", "/assets/style.css", "/assets/app.js", "/assets/data.js"];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    for (const url of SHELL) {
      try {
        const res = await fetch(url, { credentials: "same-origin", cache: "no-store" });
        if (await valid(url, res)) await cache.put(url, res);
      } catch (err) { /* 다음에 다시 */ }
    }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

// 우리 사이트가 보낸 응답인지 확인한 뒤에만 저장본을 바꾼다
async function valid(key, res) {
  if (!res || !res.ok || res.redirected || res.type !== "basic" || res.headers.get("x-tt-login")) return false;
  const ct = res.headers.get("content-type") || "";
  if (key === "/") return ct.includes("text/html") && (await res.clone().text()).includes('id="printDoc"');
  if (key === "/api/data") return ct.includes("json");
  return !ct.includes("text/html");
}

function withTimeout(p, ms) {
  return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
}

async function networkFirst(req, key, ms) {
  const cache = await caches.open(VERSION);
  try {
    const res = await withTimeout(fetch(req), ms);
    // 로그인 화면이 왔으면(쿠키 만료 등) 저장본을 덮어쓰지 않고 그대로 보여준다
    if (await valid(key, res)) await cache.put(key, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(key);
    if (!hit) throw err;
    const headers = new Headers(hit.headers);
    headers.set("x-tt-offline", "1");
    return new Response(await hit.blob(), { status: 200, headers });
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req, { ignoreSearch: true });
  const fresh = fetch(req).then((res) => {
    if (res.ok && res.type === "basic" && !res.redirected && !res.headers.get("x-tt-login")) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  return hit || (await fresh) || new Response("", { status: 504 });
}

async function cacheFirst(req) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === "opaque") cache.put(req, res.clone());
  return res;
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    if (req.mode === "navigate") {
      e.respondWith(networkFirst(req, "/", 6000).catch(() =>
        new Response("<meta charset=utf-8><p style='font-family:sans-serif;padding:24px'>오프라인이에요. 인터넷에 연결된 뒤 한 번 열어 두면 다음부터는 오프라인에서도 보여요.</p>",
          { headers: { "Content-Type": "text/html; charset=utf-8" } })));
      return;
    }
    if (url.pathname.startsWith("/assets/")) { e.respondWith(networkFirst(req, url.pathname, 4000)); return; }
    if (url.pathname === "/api/data") { e.respondWith(networkFirst(req, "/api/data", 5000)); return; }
    return; // 편집·이력·로그인 등은 항상 네트워크
  }

  if (url.hostname === "cdn.jsdelivr.net" && url.pathname.includes("pretendard")) {
    e.respondWith(cacheFirst(req));
  }
});

// 오프라인 준비: 앱이 보낸 주소 목록을 모두 받아 저장하고 결과를 돌려준다
self.addEventListener("message", (e) => {
  const m = e.data || {};
  if (m.type !== "prep" || !Array.isArray(m.urls)) return;
  const port = e.ports && e.ports[0];
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    let ok = 0;
    const fail = [];
    for (const u of m.urls) {
      try {
        const res = await withTimeout(fetch(u, { credentials: "same-origin", cache: "no-store" }), 15000);
        if (await valid(u, res)) { await cache.put(u, res); ok++; } else fail.push(u);
      } catch (err) { fail.push(u); }
    }
    if (port) port.postMessage({ ok, total: m.urls.length, fail });
  })());
});
