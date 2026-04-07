import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { sha256 } from "../services/auth";

export default function Registro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    usuarioSistema: "",
    email:          "",
    clave:          "",
    claveConfirmar: "",
  });
  const [error, setError]       = useState("");
  const [cargando, setCargando] = useState(false);
  const [exito, setExito]       = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.usuarioSistema || !form.email || !form.clave || !form.claveConfirmar) {
      setError("Completá todos los campos.");
      return;
    }
    if (form.clave !== form.claveConfirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (form.clave.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setCargando(true);
    try {
      // Hashear contraseña antes de enviar — igual que en Productos
      const claveHash = await sha256(form.clave);

      await api("/api/EmpleadoAuth/RegistrarEmpleado", {
        method: "POST",
        body: {
          usuarioSistema: form.usuarioSistema,
          claveHash,
          email: form.email,
        },
      });

      setExito(true);
    } catch {
      setError("No se encontró un empleado con ese email. Contactá al administrador.");
    } finally {
      setCargando(false);
    }
  }

  if (exito) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 text-center">
          <span className="text-5xl mb-4 block">✅</span>
          <h2 className="text-xl font-bold text-gray-800 mb-2">¡Cuenta activada!</h2>
          <p className="text-sm text-gray-500 mb-6">
            Tu usuario y contraseña fueron registrados correctamente.
          </p>
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold
                       rounded-lg py-2 text-sm transition-colors"
          >
            Ir al login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <span className="text-4xl mb-2">🌿</span>
          <h1 className="text-2xl font-bold text-green-700">Activar cuenta</h1>
          <p className="text-sm text-gray-500 mt-1 text-center">
            Usá el email con el que el administrador te registró
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario deseado
            </label>
            <input
              type="text"
              name="usuarioSistema"
              value={form.usuarioSistema}
              onChange={handleChange}
              placeholder="mi_usuario"
              autoComplete="username"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email registrado
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="clave"
              value={form.clave}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="claveConfirmar"
              value={form.claveConfirmar}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60
                       text-white font-semibold rounded-lg py-2 text-sm transition-colors"
          >
            {cargando ? "Activando..." : "Activar cuenta"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="text-green-600 hover:underline font-medium">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
