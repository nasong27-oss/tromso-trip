/**
 * 저장소 계층 — 모든 저장은 "새 버전 파일 추가" 방식 (덮어쓰기 없음).
 *  trip/v/<13자리 ms>.json  = { doc, meta: { editor, at, note } }
 * 가장 최근 파일이 현재 내용이고, 나머지는 그대로 변경 이력이 된다.
 * Vercel 에서는 Blob, 로컬 테스트에서는 STORE_DIR 폴더를 쓴다.
 */
import { createHash } from "node:crypto";

const PREFIX = "trip/v/";

export function storageReady() {
  return Boolean(process.env.STORE_DIR || process.env.BLOB_READ_WRITE_TOKEN);
}

/* ---------- 로컬(파일) 백엔드 ---------- */
async function fsBackend() {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const dir = path.join(process.env.STORE_DIR, "trip", "v");
  await fs.mkdir(dir, { recursive: true });
  return {
    async list() {
      const names = (await fs.readdir(dir)).filter((n) => n.endsWith(".json"));
      return names.map((n) => ({ pathname: PREFIX + n, url: path.join(dir, n) }));
    },
    async read(item) { return JSON.parse(await fs.readFile(item.url, "utf8")); },
    async write(pathname, json) { await fs.writeFile(path.join(dir, pathname.slice(PREFIX.length)), json); },
  };
}

/* ---------- Vercel Blob 백엔드 ---------- */
async function blobBackend() {
  const { put, list, get } = await import("@vercel/blob");
  return {
    async list() {
      const out = [];
      let cursor;
      do {
        const r = await list({ prefix: PREFIX, limit: 1000, cursor });
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
    async write(pathname, json) {
      const opts = { contentType: "application/json", addRandomSuffix: true };
      try {
        await put(pathname, json, { ...opts, access: "private" });
      } catch (e) {
        // public 으로 만든 저장소면 private 쓰기가 거부됨 → public 으로 재시도 (랜덤 주소라 추측 불가)
        await put(pathname, json, { ...opts, access: "public" });
      }
    },
  };
}

async function backend() {
  return process.env.STORE_DIR ? fsBackend() : blobBackend();
}

function stamp(pathname) {
  const m = pathname.match(/trip\/v\/(\d{13})/);
  return m ? m[1] : "0";
}

/** 버전 목록 (최신순) — 각 항목 id 는 13자리 타임스탬프 */
export async function versions() {
  const b = await backend();
  const items = await b.list();
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

export async function writeVersion(doc, meta) {
  const b = await backend();
  let id = String(Date.now());
  const existing = new Set((await versions()).map((v) => v.id));
  while (existing.has(id)) id = String(Number(id) + 1);
  const payload = JSON.stringify({ doc, meta: { ...meta, at: new Date(Number(id)).toISOString() } });
  await b.write(PREFIX + id + ".json", payload);
  return id;
}

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
