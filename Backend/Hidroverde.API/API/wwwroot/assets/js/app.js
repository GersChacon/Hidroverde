const view = document.getElementById("view");
const env = document.getElementById("env");
const topTitle = document.getElementById("topTitle");
const navButtons = document.querySelectorAll(".nav button[data-page]");

env.textContent = window.location.origin;

let currentPage = null;

function setActive(page) {
    navButtons.forEach(b => b.classList.toggle("active", b.dataset.page === page));
    topTitle.textContent = "Hidroverde · " + page.charAt(0).toUpperCase() + page.slice(1);
}

function setPageCss(page) {
    // quitar css anterior si existe
    document.getElementById("pageCss")?.remove();

    // agregar el css de esa página (si existe)
    const link = document.createElement("link");
    link.id = "pageCss";
    link.rel = "stylesheet";
    link.href = `/assets/css/pages/${page}.css?ts=${Date.now()}`;

    // ✅ si no existe, no rompe
    link.onerror = () => {
        console.debug("No existe CSS para:", page);
        link.remove();
    };

    document.head.appendChild(link);
}

async function loadPage(page) {
    currentPage = page;

    setActive(page);
    setPageCss(page);

    const res = await fetch(`/pages/${page}.html`, { cache: "no-store" });

    if (!res.ok) {
        view.innerHTML = `<div class="card">No se pudo cargar /pages/${page}.html</div>`;
        return;
    }

    const html = await res.text();

    // ✅ Si por alguna razón cambiaste de página mientras cargaba, no pisar
    if (currentPage !== page) return;

    view.innerHTML = html;

    // carga el JS de la página si existe (ESM)
    try {
        const mod = await import(`/assets/js/pages/${page}.js?ts=${Date.now()}`);

        // ✅ si cambiaste de página, no corras init
        if (currentPage !== page) return;

        if (mod?.init) mod.init();
    } catch (e) {
        console.debug("Sin JS para page:", page);
    }
}

navButtons.forEach(b => b.addEventListener("click", () => loadPage(b.dataset.page)));

// inicial
loadPage("inicio");
