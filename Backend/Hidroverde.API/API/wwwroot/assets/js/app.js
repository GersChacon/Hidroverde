const view = document.getElementById("view");
const env = document.getElementById("env");
const topTitle = document.getElementById("topTitle");
const navButtons = document.querySelectorAll(".nav button[data-page]");

env.textContent = window.location.origin;

function setActive(page) {
    navButtons.forEach(b => b.classList.toggle("active", b.dataset.page === page));
    topTitle.textContent = "Hidroverde · " + page.charAt(0).toUpperCase() + page.slice(1);
}

async function loadPage(page) {
    setActive(page);

    const res = await fetch(`/pages/${page}.html`, { cache: "no-store" });
    if (!res.ok) {
        view.innerHTML = `<div class="card">No se pudo cargar /pages/${page}.html</div>`;
        return;
    }

    view.innerHTML = await res.text();

    // carga el JS de la página si existe (ESM)
    try {
        const mod = await import(`/assets/js/pages/${page}.js?ts=${Date.now()}`);
        if (mod?.init) mod.init();
    } catch (e) {
        // si no hay js para esa página, ok
        console.debug("Sin JS para page:", page);
    }
}

navButtons.forEach(b => b.addEventListener("click", () => loadPage(b.dataset.page)));

// inicial
loadPage("inicio");
