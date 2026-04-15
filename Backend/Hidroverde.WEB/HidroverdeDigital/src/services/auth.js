
const TOKEN_KEY    = "hv_token";
const EMPLEADO_KEY = "empleadoId";

export async function sha256(texto) {
  const encoder = new TextEncoder();
  const data    = encoder.encode(texto);
  const hash    = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

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

export function getPayload() {
  const token = getToken();
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export function getRoles() {
  const payload = getPayload();
  if (!payload) return [];
  const rolClaim =
    payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
    payload.role ??
    payload.roles ??
    [];
  return Array.isArray(rolClaim) ? rolClaim : [rolClaim];
}

export function tieneRol(...rolesRequeridos) {
  if (!rolesRequeridos.length) return true;
  const misRoles = getRoles();
  return rolesRequeridos.some(r => misRoles.includes(r));
}

export function getUsuario() {
  const payload = getPayload();
  return payload?.[
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
  ] ?? payload?.unique_name ?? payload?.name ?? "";
}
