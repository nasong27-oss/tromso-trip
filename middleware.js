/**
 * Vercel Routing Middleware — 비밀번호 게이트
 * 비밀번호를 맞히기 전에는 HTML·데이터(assets/data.js) 어느 것도 전송되지 않는다.
 * 비밀번호는 Vercel 환경변수 SITE_PASSWORD 로 바꿀 수 있다 (기본값 1224).
 * 로그인 시도 자체는 /api/login 이 처리한다 (틀린 횟수 기록 · 잠금).
 */
import { loginHtml, LOGIN_HEADERS } from "./api/_login-page.js";

export const config = { matcher: "/:path*" };

const COOKIE = "tt_auth";
const PUBLIC = new Set(["/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/apple-touch-icon.png", "/sw.js"]);
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

  // 비밀번호 확인은 /api/login (서버 함수) 에서 — 틀린 횟수를 기록하고 5번 틀리면 10분 잠금
  if (url.pathname === "/api/login") return next();
  if (url.pathname === "/__login") return new Response(null, { status: 303, headers: { Location: "/" } });
  // 홈 화면 아이콘·앱 정보·오프라인 스크립트는 로그인 전에도 필요 (민감 정보 없음)
  if (PUBLIC.has(url.pathname)) return next();

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
  return new Response(loginHtml({ len: pw.length }), { status: 200, headers: LOGIN_HEADERS });
}
