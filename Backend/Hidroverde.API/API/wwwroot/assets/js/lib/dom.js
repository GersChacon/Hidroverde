export const $ = (sel, root = document) => root.querySelector(sel);

export function escapeHtml(val) {
    const s = String(val ?? "");
    return s
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

export function setText(idOrEl, text) {
    const el = typeof idOrEl === "string" ? document.getElementById(idOrEl) : idOrEl;
    if (el) el.textContent = text ?? "";
}

export function setValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val ?? "";
}
