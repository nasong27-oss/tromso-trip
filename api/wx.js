// GET /api/wx?lat=..&lon=..  — 상단 날씨 · 오로라 카드용
// 날씨: 노르웨이 기상청(MET Norway) locationforecast  ·  오로라: NOAA SWPC Kp 예보
// 같은 위치는 30분 동안 메모리에 보관 (외부 서비스 호출 최소화)
import { send } from "./_store.js";

const UA = "tromso-trip/1.0 github.com/nasong27-oss/tromso-trip";
const TTL = 30 * 60 * 1000;
const CACHE = new Map();

async function getJson(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(url + " " + r.status);
  return r.json();
}

// 트롬쇠 기준 "오늘 밤" = 현지 18시 ~ 다음 날 02시 (UTC 17 ~ 01). 새벽 6시 전이면 지금 진행 중인 밤
function tonight(now) {
  const d = new Date(now);
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 17));
  if (d.getUTCHours() < 5) start.setUTCDate(start.getUTCDate() - 1);
  return [start.getTime(), start.getTime() + 8 * 3600e3];
}

function weather(j, now) {
  const ts = (j && j.properties && j.properties.timeseries) || [];
  if (!ts.length) return null;
  let cur = ts[0];
  for (const t of ts) { if (Date.parse(t.time) <= now) cur = t; else break; }
  const d = cur.data.instant.details;
  const n1 = cur.data.next_1_hours || cur.data.next_6_hours || {};
  const [a, b] = tonight(now);
  const from = Math.max(a, now - 3600e3);
  const night = ts.filter((t) => { const x = Date.parse(t.time); return x >= from && x <= b; })
    .map((t) => t.data.instant.details.cloud_area_fraction).filter((v) => typeof v === "number");
  return {
    t: d.air_temperature, wind: d.wind_speed, cloud: d.cloud_area_fraction,
    symbol: (n1.summary && n1.summary.symbol_code) || "",
    precip: n1.details && n1.details.precipitation_amount,
    nightCloud: night.length ? Math.round(night.reduce((s, v) => s + v, 0) / night.length) : null
  };
}

// NOAA 형식: 예전엔 [[머리글…], [값…]…], 2026년부터 [{time_tag, kp, observed…}…] — 둘 다 받기
function kpRows(j) {
  if (!Array.isArray(j) || !j.length) return [];
  let rows = j;
  if (Array.isArray(j[0])) { const h = j[0]; rows = j.slice(1).map((r) => Object.fromEntries(h.map((k, i) => [k, r[i]]))); }
  return rows.map((r) => {
    const tk = Object.keys(r).find((k) => /time/i.test(k));
    const kk = Object.keys(r).find((k) => /^kp$/i.test(k)) || Object.keys(r).find((k) => /kp/i.test(k));
    const t = Date.parse(String(r[tk]).replace(" ", "T") + (/[zZ]|[+-]\d\d:?\d\d$/.test(String(r[tk])) ? "" : "Z"));
    return { t, kp: parseFloat(r[kk]) };
  }).filter((r) => !isNaN(r.t) && !isNaN(r.kp));
}

function aurora(j, now) {
  const rows = kpRows(j);
  if (!rows.length) return null;
  let cur = rows[0];
  for (const r of rows) { if (r.t <= now) cur = r; else break; }
  const [a, b] = tonight(now);
  const night = rows.filter((r) => r.t + 3 * 3600e3 > a && r.t < b).map((r) => r.kp);
  return { now: cur.kp, tonight: night.length ? Math.max(...night) : null };
}

export default async function handler(req, res) {
  const q = new URL(req.url, "http://x").searchParams;
  const lat = Math.round(parseFloat(q.get("lat")) * 100) / 100;
  const lon = Math.round(parseFloat(q.get("lon")) * 100) / 100;
  // 트롬쇠 주변만 (다른 용도로 쓰이지 않게)
  if (!(lat > 69 && lat < 70.5 && lon > 17 && lon < 21)) return send(res, 400, { error: "location" });
  const key = lat + "," + lon;
  const hit = CACHE.get(key);
  if (hit && Date.now() - hit.at < TTL) return send(res, 200, hit.body);

  const now = Date.now();
  const [met, kp] = await Promise.allSettled([
    getJson(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`),
    getJson("https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json")
  ]);
  const body = {
    at: now,
    wx: met.status === "fulfilled" ? weather(met.value, now) : null,
    kp: kp.status === "fulfilled" ? aurora(kp.value, now) : null
  };
  if (!body.wx && !body.kp) return send(res, 502, { error: "upstream" });
  CACHE.set(key, { at: now, body });
  if (CACHE.size > 20) CACHE.delete(CACHE.keys().next().value);
  return send(res, 200, body);
}
