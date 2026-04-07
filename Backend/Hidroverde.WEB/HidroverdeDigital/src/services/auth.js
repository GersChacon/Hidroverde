// Servicio de autenticación — SHA256 + token + sesión

const TOKEN_KEY    = "hv_token";
const EMPLEADO_KEY = "empleadoId";

// ── SHA256 (Web Crypto API — nativo en todos los browsers modernos) ──
export async function sha256(texto) {
  const encoder = new TextEncoder();
  const data    = encoder.encode(texto);
  const hash    = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// ── Sesión ───────────────────────────────────────────────────────────
export function guardarSesion(token, empleadoId) {
  localStorage.setItem(TOKEN_KEY,    token);
  localStorage.setItem(EMPLEADO_KEY, String(empleadoId));
}

export function cerrarSesion() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMPLEADO_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function estaAutenticado() {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
