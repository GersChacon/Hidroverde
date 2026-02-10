import { $ } from "./dom.js";

export function showModal(modalId, show) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.hidden = !show;
}

export function setModalTitle(modalId, title) {
    const h = $(`#${modalId} h3`);
    if (h) h.textContent = title ?? "";
}
