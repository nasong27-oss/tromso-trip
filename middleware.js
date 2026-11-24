/**
 * Vercel Routing Middleware — 비밀번호 게이트
 * 비밀번호를 맞히기 전에는 HTML·데이터(assets/data.js) 어느 것도 전송되지 않는다.
 * 비밀번호는 Vercel 환경변수 SITE_PASSWORD 로 바꿀 수 있다 (기본값 1224).
 */
export const config = { matcher: "/:path*" };

const COOKIE = "tt_auth";
const MAX_AGE = 60 * 60 * 24 * 60; // 60일

function password() {
  return (typeof process !== "undefined" && process.env && process.env.SITE_PASSWORD) || "1224";
}

async function tokenFor(pw) {
  const data = new TextEncoder().encode("tromso-2026:" + pw);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Vercel 의 next() 와 동일: 요청을 원래 정적 파일로 통과시킨다
function next() {
  return new Response(null, { headers: { "x-middleware-next": "1" } });
}

function readCookie(req, name) {
  const raw = req.headers.get("cookie") || "";
  const m = raw.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return m ? m[1] : null;
}

function cookieAttrs(req) {
  const secure = new URL(req.url).protocol === "https:" ? "; Secure" : "";
  return "; Path=/; HttpOnly; SameSite=Lax" + secure;
}

export default async function middleware(req) {
  const url = new URL(req.url);
  const pw = password();
  const token = await tokenFor(pw);

  if (url.pathname === "/__login" && req.method === "POST") {
    let given = "";
    try {
      const form = await req.formData();
      given = String(form.get("pw") || "").trim();
    } catch (e) { /* ignore */ }
    if (given === pw) {
      return new Response(null, {
        status: 303,
        headers: { Location: "/", "Set-Cookie": COOKIE + "=" + token + "; Max-Age=" + MAX_AGE + cookieAttrs(req) },
      });
    }
    await new Promise((r) => setTimeout(r, 900)); // 무차별 대입 속도 늦추기
    return loginPage(true);
  }

  if (url.pathname === "/__logout") {
    return new Response(null, {
      status: 303,
      headers: { Location: "/", "Set-Cookie": COOKIE + "=; Max-Age=0" + cookieAttrs(req) },
    });
  }

  if (readCookie(req, COOKIE) === token) return next();

  // 인증 전: 페이지 요청이면 로그인 화면, 그 밖의 파일은 차단
  const isPage = req.method === "GET" && (url.pathname === "/" || url.pathname.endsWith(".html"));
  if (!isPage) return new Response("Unauthorized", { status: 401, headers: { "Cache-Control": "no-store" } });
  return loginPage(false);
}

function loginPage(failed) {
  const html = `<!doctype html>
<html lang="ko"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><meta name="theme-color" content="#0c1424">
<title>Tromsø 2026</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<style>
*{box-sizing:border-box}
body{margin:0;min-height:100vh;min-height:100dvh;display:grid;place-items:center;padding:24px;color:#fff;
font-family:"Pretendard Variable",Pretendard,-apple-system,"Apple SD Gothic Neo",sans-serif;
background:#0c1424 radial-gradient(120% 70% at 20% 0%,rgba(95,211,168,.28),transparent 60%),radial-gradient(90% 60% at 100% 20%,rgba(130,110,230,.22),transparent 60%)}
.box{width:100%;max-width:340px;text-align:center}
.eb{font-size:11px;letter-spacing:.18em;font-weight:600;color:rgba(255,255,255,.6);margin:0}
h1{margin:8px 0 6px;font-size:56px;line-height:1;font-weight:300;letter-spacing:-.04em}
p.sub{margin:0 0 32px;font-size:14px;color:rgba(255,255,255,.7)}
input{width:100%;padding:16px;font-size:28px;letter-spacing:.6em;text-align:center;border-radius:14px;border:1px solid rgba(255,255,255,.2);
background:rgba(255,255,255,.06);color:#fff;outline:none;font-family:inherit;text-indent:.6em}
input:focus{border-color:#5fd3a8}
button{margin-top:12px;width:100%;padding:14px;font-size:15px;font-weight:650;border:0;border-radius:14px;background:#fff;color:#0c1424;cursor:pointer;font-family:inherit}
.err{margin:14px 0 0;font-size:13px;color:#f7a29a;min-height:1em}
</style></head><body>
<form class="box" method="post" action="/__login">
<p class="eb">TRAVEL GUIDE — NORWAY</p>
<h1>Tromsø</h1>
<p class="sub">2026. 12. 24 – 2027. 1. 1</p>
<input name="pw" type="password" inputmode="numeric" autocomplete="current-password" maxlength="12" placeholder="••••" aria-label="비밀번호" autofocus required>
<button type="submit">들어가기</button>
<p class="err">${failed ? "비밀번호가 맞지 않아요" : ""}</p>
</form></body></html>`;
  return new Response(html, {
    status: failed ? 401 : 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
