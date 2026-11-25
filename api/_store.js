/**
 * 저장소 계층 — 모든 저장은 "새 버전 파일 추가" 방식 (덮어쓰기 없음).
 *  trip/v/<13자리 ms>.json  = { doc, meta: { editor, at, note } }
 * 가장 최근 파일이 현재 내용이고, 나머지는 그대로 변경 이력이 된다.
 * Vercel 에서는 Blob, 로컬 테스트에서는 STORE_DIR 폴더를 쓴다.
 */
import { createHash } from "node:crypto";

const PREFIX = "trip/v/";

export function storageReady() {
  // 읽기·쓰기 토큰, 또는 최신 Vercel 기본값인 OIDC 연결(BLOB_STORE_ID) 둘 다 인정
  return Boolean(process.env.STORE_DIR || process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

/* ---------- 로컬(파일) 백엔드 ---------- */
async function fsBackend() {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const root = process.env.STORE_DIR;
  return {
    async list(prefix) {
      const dir = path.join(root, prefix);
      await fs.mkdir(dir, { recursive: true });
      const names = (await fs.readdir(dir)).filter((n) => !n.startsWith("."));
      return names.map((n) => ({ pathname: prefix + n, url: path.join(dir, n) }));
    },
    async read(item) { return JSON.parse(await fs.readFile(item.url, "utf8")); },
    async write(pathname, body) {
      const full = path.join(root, pathname);
      await fs.mkdir(path.dirname(full), { recursive: true });
      await fs.writeFile(full, body);
    },
    async remove(items) { await Promise.all(items.map((it) => fs.rm(it.url, { force: true }))); },
  };
}

/* ---------- Vercel Blob 백엔드 ---------- */
async function blobBackend() {
  const { put, list, get, del } = await import("@vercel/blob");
  return {
    async list(prefix) {
      const out = [];
      let cursor;
      do {
        const r = await list({ prefix, limit: 1000, cursor });
        out.push(...r.blobs.map((b) => ({ pathname: b.pathname, url: b.url })));
        cursor = r.hasMore ? r.cursor : undefined;
      } while (cursor);
      return out;
    },
    async read(item) {
      try {
        const r = await get(item.url, { access: "private", useCache: false });
        if (r && r.statusCode === 200) return JSON.parse(await new Response(r.stream).text());
      } catch (e) { /* public 저장소일 수 있음 */ }
      const res = await fetch(item.url, { cache: "no-store" });
      if (!res.ok) throw new Error("blob read failed " + res.status);
      return res.json();
    },
    async write(pathname, body) {
      const opts = { contentType: "application/json", addRandomSuffix: true };
      try {
        await put(pathname, body, { ...opts, access: "private" });
      } catch (e) {
        // public 으로 만든 저장소면 private 쓰기가 거부됨 → public 으로 재시도 (랜덤 주소라 추측 불가)
        await put(pathname, body, { ...opts, access: "public" });
      }
    },
    async remove(items) { if (items.length) await del(items.map((it) => it.url)); },
  };
}

export async function backend() {
  return process.env.STORE_DIR ? fsBackend() : blobBackend();
}

function stamp(pathname) {
  const m = pathname.match(/trip\/v\/(\d{13})/);
  return m ? m[1] : "0";
}

/** 버전 목록 (최신순) — 각 항목 id 는 13자리 타임스탬프. Blob 의 list 1회 사용 */
export async function versions() {
  const b = await backend();
  const items = await b.list(PREFIX);
  const byId = new Map();
  for (const it of items) byId.set(stamp(it.pathname), it); // 같은 ms 중복은 하나만
  return [...byId.entries()]
    .sort((a, z) => (a[0] < z[0] ? 1 : -1))
    .map(([id, it]) => ({ id, item: it }));
}

export async function readVersion(entry) {
  const b = await backend();
  return b.read(entry.item);
}

/** 새 버전 저장. known = 방금 조회한 versions() 결과 (list 호출을 아끼려고 재사용) */
export async function writeVersion(doc, meta, known) {
  const b = await backend();
  let id = String(Date.now());
  const existing = new Set((known || []).map((v) => v.id));
  while (existing.has(id)) id = String(Number(id) + 1);
  const payload = JSON.stringify({ doc, meta: { ...meta, at: new Date(Number(id)).toISOString() } });
  await b.write(PREFIX + id + ".json", payload);
  setCurrent({ doc, version: id, meta: { ...meta, at: new Date(Number(id)).toISOString() } });
  return id;
}

/* ---------- 현재 내용 메모리 캐시 ----------
   페이지를 열 때마다 저장소 목록을 조회하면 무료 한도(월 2천 회 안팎)를 금방 쓴다.
   서버 인스턴스가 최신 내용을 60초 기억해 두고, 편집 시작·저장 때만 새로 확인한다. */
const TTL = 60 * 1000;
let CURRENT = null; // { doc, version, meta, at }
export function getCurrent() {
  return CURRENT && Date.now() - CURRENT.at < TTL ? CURRENT : null;
}
export function setCurrent(v) { CURRENT = v ? { ...v, at: Date.now() } : null; }

/* ---------- 쿠키 · 편집 권한 ---------- */
export function cookie(req, name) {
  const raw = req.headers.cookie || "";
  const m = raw.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[1]) : null;
}
export function editToken() {
  const pw = process.env.EDIT_PASSWORD;
  if (!pw) return null;
  return createHash("sha256").update("tromso-edit:" + pw).digest("hex");
}
export function canEdit(req) {
  const t = editToken();
  return Boolean(t && cookie(req, "tt_edit") === t);
}
export function editorName(req) {
  const n = cookie(req, "tt_editor");
  return n ? n.slice(0, 20) : "익명";
}

export function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  // 배포 버전: 홈 화면 앱이 다시 열릴 때 새 배포가 있으면 스스로 새로고침하도록
  const build = process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_GIT_COMMIT_SHA || "";
  if (build) res.setHeader("X-TT-Build", build);
  res.end(JSON.stringify(body));
}

export async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const s = Buffer.concat(chunks).toString("utf8");
  return s ? JSON.parse(s) : {};
}
