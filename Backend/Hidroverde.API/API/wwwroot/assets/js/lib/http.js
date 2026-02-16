function getEmpleadoId() {
    return localStorage.getItem("empleadoId") || "1";
}

export async function api(url, { method = "GET", body, cache = "no-store" } = {}) {
    const opts = {
        method,
        cache,
        headers: {
            "X-Empleado-Id": getEmpleadoId()
        }
    };

    if (body !== undefined) {
        opts.headers["Content-Type"] = "application/json";
        opts.body = JSON.stringify(body);
    }

    const res = await fetch(url, opts);

    if (res.status === 204) return { ok: true, status: 204, data: null };

    const contentType = res.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
        ? await res.json().catch(() => null)
        : await res.text().catch(() => "");

    if (!res.ok) {
        const msg =
            typeof payload === "string" ? payload : JSON.stringify(payload ?? {});
        throw new Error(`HTTP ${res.status} ${res.statusText}: ${msg}`);
    }

    return { ok: true, status: res.status, data: payload };
}
