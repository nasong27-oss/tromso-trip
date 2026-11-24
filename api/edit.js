// 편집 권한: GET 상태 확인 · POST 편집 비번 확인 · DELETE 편집 로그아웃
import { storageReady, editToken, canEdit, editorName, send, readBody } from "./_store.js";

function attrs(req) {
  const https = (req.headers["x-forwarded-proto"] || "").includes("https");
  return "; Path=/; SameSite=Lax; Max-Age=2592000" + (https ? "; Secure" : "");
}

export default async function handler(req, res) {
  const configured = Boolean(editToken());
  if (req.method === "GET") {
    return send(res, 200, { configured, storage: storageReady(), canEdit: canEdit(req), name: editorName(req) });
  }
  if (req.method === "POST") {
    if (!configured) return send(res, 503, { error: "not-configured" });
    const body = await readBody(req).catch(() => ({}));
    const pw = String(body.pw || "").trim();
    if (pw !== process.env.EDIT_PASSWORD) {
      await new Promise((r) => setTimeout(r, 900));
      return send(res, 401, { error: "wrong" });
    }
    const name = String(body.name || "").trim().slice(0, 20) || "익명";
    res.setHeader("Set-Cookie", [
      "tt_edit=" + editToken() + "; HttpOnly" + attrs(req),
      "tt_editor=" + encodeURIComponent(name) + attrs(req),
    ]);
    return send(res, 200, { ok: true, name });
  }
  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", ["tt_edit=; Path=/; Max-Age=0", "tt_editor=; Path=/; Max-Age=0"]);
    return send(res, 200, { ok: true });
  }
  return send(res, 405, { error: "method" });
}
