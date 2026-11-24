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
    return loginPage(true, pw.length);
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
  return loginPage(false, pw.length);
}

function loginPage(failed, len) {
  const n = Math.min(Math.max(len || 4, 1), 12);
  const boxes = Array.from({ length: n }, (_, i) => '<span class="cell" data-i="' + i + '"></span>').join("");
  const html = `<!doctype html>
<html lang="ko"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<meta name="robots" content="noindex, nofollow"><meta name="theme-color" content="#0c1424">
<title>Tromsø 2026</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<style>
*{box-sizing:border-box}
body{margin:0;min-height:100vh;min-height:100dvh;display:grid;place-items:center;padding:24px;color:#fff;
font-family:"Pretendard Variable",Pretendard,-apple-system,"Apple SD Gothic Neo",sans-serif;
background:radial-gradient(120% 70% at 20% 0%,rgba(95,211,168,.28),transparent 60%),radial-gradient(90% 60% at 100% 20%,rgba(130,110,230,.22),transparent 60%),#0c1424}
.box{width:100%;max-width:340px;text-align:center}
h1{margin:0;font-size:38px;line-height:1.05;font-weight:700;letter-spacing:-.035em;white-space:nowrap}
.lat{margin:6px 0 12px;font-size:19px;color:rgba(255,255,255,.72)}
p.sub{margin:0 0 36px;font-size:14px;color:rgba(255,255,255,.7)}
.label{margin:0 0 12px;font-size:14px;font-weight:600;color:rgba(255,255,255,.9)}
.pin{position:relative;display:flex;justify-content:center;gap:12px}
.cell{width:56px;height:64px;border-radius:14px;border:1.5px solid rgba(255,255,255,.28);background:rgba(255,255,255,.06);display:grid;place-items:center;transition:border-color .15s,background .15s}
.cell.filled::after{content:"";width:12px;height:12px;border-radius:50%;background:#fff}
.cell.active{border-color:#5fd3a8;background:rgba(95,211,168,.12);box-shadow:0 0 0 4px rgba(95,211,168,.18)}
.pin input{position:absolute;inset:0;width:100%;height:100%;opacity:0;border:0;font-size:16px;color:transparent;caret-color:transparent;background:transparent}
.hint{margin:16px 0 0;font-size:13.5px;color:rgba(255,255,255,.75)}
.tap{margin:6px 0 0;font-size:12px;color:rgba(255,255,255,.45)}
.err{margin:14px 0 0;font-size:13.5px;font-weight:600;color:#f7a29a;min-height:1.2em}
.shake{animation:shake .4s}
@keyframes shake{20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
</style></head><body>
<form class="box" method="post" action="/__login" id="f">
<h1>Tromsø, Norway</h1>
<p class="lat">69° N</p>
<p class="sub">2026. 12. 24 (목) – 2027. 1. 1 (금)</p>
<p class="label">비밀번호 ${n}자리</p>
<div class="pin${failed ? " shake" : ""}" id="pin">${boxes}
<input id="pw" name="pw" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="${n}" autocomplete="off" aria-label="비밀번호 ${n}자리" autofocus required>
</div>
<p class="hint">힌트: 여행 출발일</p>
<p class="tap">칸을 누르면 숫자 키패드가 열려요</p>
<p class="err">${failed ? "비밀번호가 맞지 않아요. 다시 입력해 주세요" : ""}</p>
<noscript><button type="submit">들어가기</button></noscript>
</form>
<script>
(function(){
  var n=${n}, input=document.getElementById("pw"), cells=document.querySelectorAll(".cell"), sent=false;
  function paint(){
    var v=input.value;
    cells.forEach(function(c,i){c.classList.toggle("filled",i<v.length);c.classList.toggle("active",i===Math.min(v.length,n-1)&&document.activeElement===input);});
    if(v.length===n&&!sent){sent=true;setTimeout(function(){document.getElementById("f").submit();},120);}
  }
  input.addEventListener("input",function(){input.value=input.value.replace(/[^0-9]/g,"").slice(0,n);paint();});
  input.addEventListener("focus",paint);input.addEventListener("blur",paint);
  document.getElementById("pin").addEventListener("click",function(){input.focus();});
  input.focus();paint();
})();
</script>
</body></html>`;
  return new Response(html, {
    status: failed ? 401 : 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
