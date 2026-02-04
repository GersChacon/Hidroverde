export function init() {
    const body = document.getElementById("ciclosBody");
    const btnRefrescar = document.getElementById("btnRefrescarCiclos");
    const btnNueva = document.getElementById("btnNuevaSiembra");

    const modal = document.getElementById("modalSiembra");
    const btnCerrar = document.getElementById("btnCerrarModal");
    const btnGuardar = document.getElementById("btnGuardarSiembra");
    const msg = document.getElementById("siMsg");

    btnRefrescar?.addEventListener("click", cargarCiclos);
    btnNueva?.addEventListener("click", () => { modal.hidden = false; msg.textContent = ""; });
    btnCerrar?.addEventListener("click", () => modal.hidden = true);

    // por ahora solo UI: (POST lo agregamos cuando tengas endpoint)
    btnGuardar?.addEventListener("click", async () => {
        msg.textContent = "Pendiente: falta endpoint POST /api/ciclos/siembra";
    });

    cargarCiclos();

    async function cargarCiclos() {
        body.innerHTML = `<tr><td colspan="8" class="muted">Cargando…</td></tr>`;
        try {
            const r = await fetch("/api/ciclos/activos");
            if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
            const data = await r.json();

            if (!Array.isArray(data) || data.length === 0) {
                body.innerHTML = `<tr><td colspan="8" class="muted">No hay ciclos activos.</td></tr>`;
                return;
            }

            body.innerHTML = data.map(c => `
        <tr>
          <td>${c.cicloId ?? ""}</td>
          <td>${c.productoId ?? ""}</td>
          <td>${c.torreId ?? ""}</td>
          <td>${c.estadoNombre ?? ""}</td>
          <td>${(c.fechaSiembra ?? "").toString().substring(0, 10)}</td>
          <td>${(c.fechaCosechaEstimada ?? "").toString().substring(0, 10)}</td>
          <td>${c.cantidadPlantas ?? ""}</td>
          <td>${c.responsableNombre ?? ""}</td>
        </tr>
      `).join("");
        } catch (e) {
            body.innerHTML = `<tr><td colspan="8" class="danger">Error: ${e.message}</td></tr>`;
        }
    }
}
