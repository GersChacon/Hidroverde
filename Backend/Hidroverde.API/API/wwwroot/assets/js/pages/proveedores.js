const API = "/api/proveedores";

export function init() {
    // ====== Tabs (si existen) ======
    const tabPend = document.getElementById("tabPendientes");
    const tabPagos = document.getElementById("tabPagos");
    const viewPend = document.getElementById("viewPendientes");
    const viewPagos = document.getElementById("viewPagos");

    // ====== Pendientes ======
    const tbody = document.getElementById("tablaProveedores");
    const empty = document.getElementById("provEmpty");

    // ====== Modal pago ======
    const modalPago = document.getElementById("modalPago");
    const inputMonto = document.getElementById("inputMontoPago");
    const provIdInput = document.getElementById("provIdSeleccionado");
    const btnCancelarPago = document.getElementById("btnCancelarPago");
    const btnConfirmarPago = document.getElementById("btnConfirmarPago");

    // ====== Modal historial por proveedor ======
    const modalHist = document.getElementById("modalHistorial");
    const btnCerrarHist = document.getElementById("btnCerrarHistorial");
    const tablaHist = document.getElementById("tablaHistorial");
    const histTitle = document.getElementById("histTitle");
    const histEmpty = document.getElementById("histEmpty");

    // ====== Pagos globales ======
    const tablaPagos = document.getElementById("tablaPagos");
    const pagosEmpty = document.getElementById("pagosEmpty");

    // ---------- Helpers ----------
    function fmt(n) {
        const num = Number(n ?? 0);
        return new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC" }).format(num);
    }

    function fmtDate(d) {
        const dt = new Date(d);
        if (isNaN(dt.getTime())) return "";
        return dt.toLocaleString("es-CR");
    }

    function tagEstado(estado) {
        const cls = (estado || "").toLowerCase(); // parcial/total/pendiente
        return `<span class="prov-tag ${cls}">${estado ?? ""}</span>`;
    }

    function activarTab(nombre) {
        const esPend = nombre === "pendientes";

        tabPend?.classList.toggle("active", esPend);
        tabPagos?.classList.toggle("active", !esPend);

        if (viewPend) viewPend.style.display = esPend ? "block" : "none";
        if (viewPagos) viewPagos.style.display = esPend ? "none" : "block";
    }

    async function apiJson(url, options) {
        const resp = await fetch(url, options);
        if (!resp.ok) {
            const t = await resp.text();
            throw new Error(t || `HTTP ${resp.status}`);
        }
        return await resp.json();
    }

    // ---------- Pendientes ----------
    async function cargarPendientes() {
        if (!tbody) return;

        const data = await apiJson(`${API}/pendientes-pago`);

        tbody.innerHTML = "";
        if (empty) empty.style.display = data.length ? "none" : "block";
        if (!data.length) return;

        data.forEach(p => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td>${p.nombre ?? ""}</td>
        <td>${fmt(p.totalCompras)}</td>
        <td>${fmt(p.totalPagado)}</td>
        <td>${fmt(p.saldoPendiente)}</td>
        <td><button class="btn-pagar" type="button">Pagar</button></td>
        <td><button class="btn-hist" type="button">Historial</button></td>
      `;

            tr.querySelector(".btn-pagar")?.addEventListener("click", () => abrirModalPago(p.proveedorId));
            tr.querySelector(".btn-hist")?.addEventListener("click", () => abrirHistorial(p.proveedorId, p.nombre));

            tbody.appendChild(tr);
        });
    }

    function abrirModalPago(proveedorId) {
        if (!modalPago || !provIdInput || !inputMonto) return;

        provIdInput.value = String(proveedorId);
        inputMonto.value = "";
        modalPago.style.display = "flex";
        inputMonto.focus?.();
    }

    btnCancelarPago?.addEventListener("click", () => {
        if (modalPago) modalPago.style.display = "none";
    });

    btnConfirmarPago?.addEventListener("click", async () => {
        try {
            const proveedorId = parseInt(provIdInput?.value ?? "0", 10);
            const monto = parseFloat(inputMonto?.value ?? "0");

            if (!proveedorId) return alert("Proveedor inválido.");
            if (!monto || monto <= 0) return alert("Ingrese un monto válido.");

            const data = await apiJson(`${API}/pagos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ proveedorId, montoPago: monto })
            });

            alert((data.estadoPago === "PARCIAL" ? "⚠️ " : "✅ ") + (data.mensaje ?? "Pago registrado"));

            if (modalPago) modalPago.style.display = "none";

            // refresca según tab activo
            if (viewPagos && viewPagos.style.display !== "none") {
                await cargarPagosGlobal();
            } else {
                await cargarPendientes();
            }
        } catch (err) {
            console.error(err);
            alert(err.message || "Error al registrar pago");
        }
    });

    // ---------- Historial por proveedor ----------
    async function abrirHistorial(proveedorId, nombre) {
        try {
            if (!modalHist || !tablaHist || !histTitle) return;

            histTitle.textContent = `Historial de pagos · ${nombre ?? ""}`;
            tablaHist.innerHTML = "";
            if (histEmpty) histEmpty.style.display = "none";

            modalHist.style.display = "flex";

            const data = await apiJson(`${API}/${proveedorId}/pagos`);

            if (!data.length) {
                if (histEmpty) histEmpty.style.display = "block";
                return;
            }

            data.forEach(x => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
          <td>${fmtDate(x.fechaPago)}</td>
          <td>${fmt(x.montoPago)}</td>
          <td>${fmt(x.saldoAntes)}</td>
          <td>${fmt(x.saldoDespues)}</td>
          <td>${tagEstado(x.estadoPago)}</td>
          <td>${x.comentario ?? ""}</td>
        `;
                tablaHist.appendChild(tr);
            });
        } catch (err) {
            console.error(err);
            if (tablaHist) tablaHist.innerHTML = `<tr><td colspan="6">${err.message}</td></tr>`;
        }
    }

    btnCerrarHist?.addEventListener("click", () => {
        if (modalHist) modalHist.style.display = "none";
    });

    // ---------- Pagos globales ----------
    async function cargarPagosGlobal() {
        if (!tablaPagos) return;

        const data = await apiJson(`${API}/pagos`);

        tablaPagos.innerHTML = "";
        if (pagosEmpty) pagosEmpty.style.display = data.length ? "none" : "block";
        if (!data.length) return;

        data.forEach(x => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td>${fmtDate(x.fechaPago)}</td>
        <td>${x.nombre ?? ""}</td>
        <td>${fmt(x.montoPago)}</td>
        <td>${fmt(x.saldoAntes)}</td>
        <td>${fmt(x.saldoDespues)}</td>
        <td>${tagEstado(x.estadoPago)}</td>
        <td>${x.comentario ?? ""}</td>
      `;
            tablaPagos.appendChild(tr);
        });
    }

    // ---------- Events ----------
    document.getElementById("btnRefrescar")?.addEventListener("click", async () => {
        try {
            if (viewPagos && viewPagos.style.display !== "none") {
                await cargarPagosGlobal();
            } else {
                await cargarPendientes();
            }
        } catch (err) {
            console.error(err);
            alert("Error refrescando. Revisa consola.");
        }
    });

    tabPend?.addEventListener("click", async () => {
        activarTab("pendientes");
        try {
            await cargarPendientes();
        } catch (err) {
            console.error(err);
            alert("Error cargando pendientes.");
        }
    });

    tabPagos?.addEventListener("click", async () => {
        activarTab("pagos");
        try {
            await cargarPagosGlobal();
        } catch (err) {
            console.error(err);
            alert("Error cargando pagos.");
        }
    });

    // Cerrar modal al click fuera (opcional, suave)
    modalPago?.addEventListener("click", (e) => {
        if (e.target === modalPago) modalPago.style.display = "none";
    });
    modalHist?.addEventListener("click", (e) => {
        if (e.target === modalHist) modalHist.style.display = "none";
    });

    // ---------- Init load ----------
    (async () => {
        try {
            // Si no hay tabs en tu HTML, simplemente carga pendientes
            if (!tabPend || !tabPagos || !viewPend || !viewPagos) {
                await cargarPendientes();
                return;
            }

            activarTab("pendientes");
            await cargarPendientes();
        } catch (err) {
            console.error(err);
            alert("Error inicializando proveedores. Revisa consola.");
        }
    })();
}