// Servicio central — campos mapeados desde los modelos C# reales
import { getToken } from "./auth";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export function getEmpleadoId() {
  return localStorage.getItem("empleadoId") || "1";
}

export async function api(url, { method = "GET", body, cache = "no-store" } = {}) {
  const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;

  const headers = {
    "X-Empleado-Id": getEmpleadoId(),
  };

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const opts = { method, cache, headers };

  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(fullUrl, opts);
  if (res.status === 204) return { ok: true, status: 204, data: null };

  const contentType = res.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => "");

  if (!res.ok) {
    const msg = typeof payload === "string" ? payload : JSON.stringify(payload ?? {});
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${msg}`);
  }

  return { ok: true, status: res.status, data: payload };
}

export function exportUrl(path) {
  const base = import.meta.env.VITE_API_URL ?? "";
  return `${base}${path}${path.includes("?") ? "&" : "?"}empleadoId=${getEmpleadoId()}`;
}

export const fmt = {
  moneda: (n) =>
    new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC" }).format(Number(n ?? 0)),
  fecha: (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-CR", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  },
  fechaHora: (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("es-CR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  },
};

export const UNIDADES = [
  { id: 1, nombre: "Unidad",    simbolo: "u"   },
  { id: 2, nombre: "Racimo",    simbolo: "rac" },
  { id: 3, nombre: "Bandeja",   simbolo: "bdj" },
  { id: 4, nombre: "Kilogramo", simbolo: "kg"  },
  { id: 5, nombre: "Gramo",     simbolo: "g"   },
  { id: 6, nombre: "Paquete",   simbolo: "paq" },
  { id: 7, nombre: "Atado",     simbolo: "atd" },
];
