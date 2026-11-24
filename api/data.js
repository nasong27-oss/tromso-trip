// GET: 현재 내용 (60초 캐시, ?fresh=1 이면 저장소에서 바로)  ·  PUT: 저장 (다른 사람이 먼저 저장했으면 409)
import { storageReady, versions, readVersion, writeVersion, getCurrent, setCurrent, canEdit, editorName, send, readBody } from "./_store.js";

function valid(doc) {
  return doc && typeof doc === "object" && Array.isArray(doc.days) && JSON.stringify(doc).length < 800000;
}

async function loadFresh() {
  const list = await versions();
  if (!list.length) { setCurrent({ doc: null, version: null, meta: null }); return { list, cur: getCurrent() }; }
  const v = await readVersion(list[0]);
  setCurrent({ doc: v.doc, version: list[0].id, meta: v.meta });
  return { list, cur: getCurrent() };
}

export default async function handler(req, res) {
  try {
    if (!storageReady()) return send(res, 200, { storage: false, doc: null, version: null });
    const fresh = /[?&]fresh=1/.test(req.url || "");

    if (req.method === "GET") {
      const cur = (!fresh && getCurrent()) || (await loadFresh()).cur;
      return send(res, 200, { storage: true, doc: cur.doc, version: cur.version, meta: cur.meta });
    }

    if (req.method === "PUT" || req.method === "POST") {
      if (!canEdit(req)) return send(res, 403, { error: "edit-auth" });
      const body = await readBody(req);
      if (!valid(body.doc)) return send(res, 400, { error: "invalid" });

      // 저장 직전에는 항상 저장소에서 최신 버전을 확인 (충돌 검사)
      const list = await versions();
      const latest = list[0] ? list[0].id : null;
      if (latest && latest !== (body.base || null) && !body.force) {
        const v = await readVersion(list[0]);
        setCurrent({ doc: v.doc, version: latest, meta: v.meta });
        return send(res, 409, { error: "conflict", version: latest, meta: v.meta });
      }
      // 첫 저장이면 data.js 원본을 이력의 맨 처음으로 보관
      const known = list.slice();
      if (!latest && valid(body.seed)) {
        const seedId = await writeVersion(body.seed, { editor: "초기값", note: "처음 내용 (data.js)" }, known);
        known.push({ id: seedId });
      }
      const id = await writeVersion(body.doc, { editor: editorName(req), note: body.note || "" }, known);
      return send(res, 200, { ok: true, version: id });
    }

    return send(res, 405, { error: "method" });
  } catch (e) {
    console.error(e);
    return send(res, 500, { error: "server", detail: String(e && e.message || e).slice(0, 200) });
  }
}
