const view = document.getElementById("view");
const env = document.getElementById("env");
const topTitle = document.getElementById("topTitle");

env.textContent = window.location.origin;

let currentPage = null;

function setActive(page) {
    document.querySelectorAll(".nav button[data-page]")
        .forEach(b => b.classList.toggle("active", b.dataset.page === page));
    topTitle.textContent = "Hidroverde · " + page.charAt(0).toUpperCase() + page.slice(1);
}

function setPageCss(page) {
    document.getElementById("pageCss")?.remove();

    const link = document.createElement("link");
    link.id = "pageCss";
    link.rel = "stylesheet";
    link.href = `/assets/css/pages/${page}.css?ts=${Date.now()}`;

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

    if (currentPage !== page) return;

    view.innerHTML = html;

    try {
        const mod = await import(`/assets/js/pages/${page}.js?ts=${Date.now()}`);

        if (currentPage !== page) return;

        if (mod?.init) mod.init();
    } catch (e) {
        console.debug("Sin JS para page:", page);
    }
}

// ✅ Event delegation en el nav — captura clics en botones aunque se agreguen después
document.querySelector(".nav").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-page]");
    if (btn) loadPage(btn.dataset.page);
});

// ✅ Escucha evento global de navegación (usado por páginas internas como inicio)
document.addEventListener("hidroverde:navigate", (e) => {
    if (e.detail?.page) loadPage(e.detail.page);
});

// inicial
loadPage("inicio");
