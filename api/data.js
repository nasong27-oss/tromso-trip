// GET: 현재 내용  ·  PUT: 저장 (다른 사람이 먼저 저장했으면 409)
import { storageReady, versions, readVersion, writeVersion, canEdit, editorName, send, readBody } from "./_store.js";

function valid(doc) {
  return doc && typeof doc === "object" && Array.isArray(doc.days) && JSON.stringify(doc).length < 800000;
}

export default async function handler(req, res) {
  try {
    if (!storageReady()) return send(res, 200, { storage: false, doc: null, version: null });

    if (req.method === "GET") {
      const list = await versions();
      if (!list.length) return send(res, 200, { storage: true, doc: null, version: null });
      const v = await readVersion(list[0]);
      return send(res, 200, { storage: true, doc: v.doc, version: list[0].id, meta: v.meta });
    }

    if (req.method === "PUT" || req.method === "POST") {
      if (!canEdit(req)) return send(res, 403, { error: "edit-auth" });
      const body = await readBody(req);
      if (!valid(body.doc)) return send(res, 400, { error: "invalid" });

      const list = await versions();
      const latest = list[0] ? list[0].id : null;
      if (latest && latest !== (body.base || null) && !body.force) {
        const v = await readVersion(list[0]);
        return send(res, 409, { error: "conflict", version: latest, meta: v.meta });
      }
      // 첫 저장이면 data.js 원본을 이력의 맨 처음으로 보관
      if (!latest && valid(body.seed)) {
        await writeVersion(body.seed, { editor: "초기값", note: "처음 내용 (data.js)" });
      }
      const id = await writeVersion(body.doc, { editor: editorName(req), note: body.note || "" });
      return send(res, 200, { ok: true, version: id });
    }

    return send(res, 405, { error: "method" });
  } catch (e) {
    console.error(e);
    return send(res, 500, { error: "server", detail: String(e && e.message || e).slice(0, 200) });
  }
}
