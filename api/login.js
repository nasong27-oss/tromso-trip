// 보기 비밀번호 확인 — 같은 접속 주소에서 5번 틀리면 10분 잠금 (실패 기록은 저장소에 남김)
import { createHash } from "node:crypto";
import { storageReady, backend } from "./_store.js";
import { loginHtml, LOGIN_HEADERS } from "./_login-page.js";

const MAX_FAILS = 5;
const WINDOW = 10 * 60 * 1000;   // 10분
const MAX_AGE = 60 * 60 * 24 * 60;

function password() { return process.env.SITE_PASSWORD || "1224"; }
function sha(s) { return createHash("sha256").update(s).digest("hex"); }

function clientKey(req) {
  const ip = String(req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || (req.socket && req.socket.remoteAddress) || "")
    .split(",")[0].trim();
  return sha("tt-ip:" + ip).slice(0, 16);   // 주소 원문은 저장하지 않음
}

async function readPw(req) {
  let b = req.body;
  if (b && typeof b === "object" && !Buffer.isBuffer(b)) return String(b.pw || "").trim();
  if (b == null) {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    b = Buffer.concat(chunks);
  }
  return String(new URLSearchParams(Buffer.isBuffer(b) ? b.toString("utf8") : String(b)).get("pw") || "").trim();
}

function page(res, status, opts) {
  res.statusCode = status;
  for (const [k, v] of Object.entries(LOGIN_HEADERS)) res.setHeader(k, v);
  res.end(loginHtml({ len: password().length, ...opts }));
}

function stampOf(pathname) {
  const m = pathname.match(/\/(\d{13})/);
  return m ? Number(m[1]) : 0;
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.statusCode = 303; res.setHeader("Location", "/"); return res.end(); }

  const pw = password();
  const given = await readPw(req);
  const now = Date.now();
  const prefix = "auth/fail/" + clientKey(req) + "/";

  let store = null, recent = [], all = [];
  if (storageReady()) {
    try {
      store = await backend();
      all = await store.list(prefix);
      recent = all.filter((it) => now - stampOf(it.pathname) < WINDOW);
    } catch (e) { console.error("lock check failed", e); store = null; }
  }

  // 잠금 중이면 비밀번호를 확인하지도 않는다
  if (recent.length >= MAX_FAILS) {
    const oldest = Math.min(...recent.map((it) => stampOf(it.pathname)).sort((a, z) => z - a).slice(0, MAX_FAILS));
    const mins = Math.max(1, Math.ceil((oldest + WINDOW - now) / 60000));
    return page(res, 429, { locked: true, error: "여러 번 틀려서 잠겼어요. " + mins + "분 뒤에 다시 시도해 주세요." });
  }

  if (given === pw) {
    if (store && all.length) store.remove(all).catch(() => {});   // 성공하면 실패 기록 초기화
    const secure = String(req.headers["x-forwarded-proto"] || "").includes("https") ? "; Secure" : "";
    res.statusCode = 303;
    res.setHeader("Set-Cookie", "tt_auth=" + sha("tromso-2026:" + pw) + "; Max-Age=" + MAX_AGE + "; Path=/; HttpOnly; SameSite=Lax" + secure);
    res.setHeader("Location", "/");
    res.setHeader("Cache-Control", "no-store");
    return res.end();
  }

  await new Promise((r) => setTimeout(r, 700));
  if (store) {
    try { await store.write(prefix + now + ".json", JSON.stringify({ at: new Date(now).toISOString() })); }
    catch (e) { console.error("fail log write failed", e); }
  }
  const left = MAX_FAILS - (recent.length + 1);
  if (store && left <= 0) {
    return page(res, 429, { locked: true, shake: true, error: "5번 틀려서 10분 동안 잠겼어요." });
  }
  return page(res, 401, {
    shake: true,
    error: "비밀번호가 맞지 않아요." + (store ? " (" + left + "번 더 틀리면 10분 잠금)" : " 다시 입력해 주세요"),
  });
}
