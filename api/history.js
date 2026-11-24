// GET: 변경 이력 (최신 40개)  ·  POST { restore: id }: 그 버전 내용을 새 버전으로 다시 저장
import { storageReady, versions, readVersion, writeVersion, canEdit, editorName, send, readBody } from "./_store.js";

export default async function handler(req, res) {
  try {
    if (!storageReady()) return send(res, 503, { error: "storage" });
    if (!canEdit(req)) return send(res, 403, { error: "edit-auth" });
    const list = await versions();

    if (req.method === "GET") {
      const top = list.slice(0, 40);
      const metas = await Promise.all(top.map((v) => readVersion(v).then((x) => x.meta).catch(() => ({}))));
      return send(res, 200, { items: top.map((v, i) => ({ id: v.id, ...metas[i] })), total: list.length });
    }

    if (req.method === "POST") {
      const body = await readBody(req);
      const target = list.find((v) => v.id === String(body.restore));
      if (!target) return send(res, 404, { error: "not-found" });
      const v = await readVersion(target);
      const when = new Date(Number(target.id)).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
      const id = await writeVersion(v.doc, { editor: editorName(req), note: when + " 버전으로 되돌림" });
      return send(res, 200, { ok: true, version: id, doc: v.doc });
    }

    return send(res, 405, { error: "method" });
  } catch (e) {
    console.error(e);
    return send(res, 500, { error: "server", detail: String(e && e.message || e).slice(0, 200) });
  }
}
