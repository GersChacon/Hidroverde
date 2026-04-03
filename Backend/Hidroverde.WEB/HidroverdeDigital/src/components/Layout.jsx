import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const NAV_SECTIONS = [
  {
    title: "Principal",
    items: [
      { to: "/",           label: "Inicio",      icon: "🏠" },
      { to: "/alertas",    label: "Alertas",     icon: "🔔" },
      { to: "/kpis",       label: "KPIs",        icon: "🎯" },
    ],
  },
  {
    title: "Producción",
    items: [
      { to: "/ciclos",          label: "Ciclos",              icon: "🌱" },
      { to: "/inventario",      label: "Registro inventario", icon: "📦" },
      { to: "/inventario-real", label: "Inventario",          icon: "📊" },
      { to: "/consumos",        label: "Consumos",            icon: "💧" },
      { to: "/plagas",          label: "Plagas",              icon: "🐛" },
    ],
  },
  {
    title: "Comercial",
    items: [
      { to: "/ventas",      label: "Ventas",      icon: "💰" },
      { to: "/clientes",    label: "Clientes",    icon: "👥" },
      { to: "/proveedores", label: "Proveedores", icon: "🏢" },
      { to: "/margenes",    label: "Márgenes",    icon: "📈" },
    ],
  },
  {
    title: "Administración",
    items: [
      { to: "/empleados", label: "Empleados", icon: "🧑‍💼" },
    ],
  },
];

const ALL_ITEMS = NAV_SECTIONS.flatMap(s => s.items);

const PAGE_TITLES = Object.fromEntries(
  ALL_ITEMS.map(i => [i.to, i.label])
);

export default function Layout() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? "Hidroverde";
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="px-4 pt-5 pb-3">
        <div
          className="px-4 py-3 rounded-xl font-black tracking-widest text-sm flex items-center gap-2.5"
          style={{
            background: "linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(255,255,255,0.05) 100%)",
            color: "#bbf7d0",
            border: "1px solid rgba(34,197,94,0.2)",
          }}
        >
          <span className="text-lg">🌿</span>
          HIDROVERDE
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }} />

      {/* Nav sections */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-3 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-1">
            <div
              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              {section.title}
            </div>
            <div className="flex flex-col gap-0.5">
              {section.items.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    "sidebar-link" + (isActive ? " active" : "")
                  }
                >
                  <span className="text-base leading-none w-5 text-center">{icon}</span>
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 shrink-0">
        <div className="mx-1 border-t mb-3" style={{ borderColor: "rgba(255,255,255,0.06)" }} />
        <a
          href="/swagger"
          target="_blank"
          rel="noreferrer"
          className="sidebar-link"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <span className="w-5 text-center">📋</span>
          <span>Swagger</span>
          <span className="ml-auto text-xs opacity-40">↗</span>
        </a>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex fixed top-0 left-0 bottom-0 w-[260px] flex-col z-20"
        style={{
          background: "linear-gradient(180deg, #0a1f15 0%, #0f2a1f 50%, #0a1f15 100%)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay md:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 w-[280px] flex flex-col z-40 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "linear-gradient(180deg, #0a1f15 0%, #0f2a1f 50%, #0a1f15 100%)",
        }}
      >
        {sidebarContent}
      </aside>

      {/* Main area */}
      <div className="md:ml-[260px] flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header
          className="sticky top-0 z-10 flex items-center justify-between px-4 md:px-6 h-14"
          style={{
            background: "rgba(248,250,252,0.88)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl
                         hover:bg-gray-100 transition-colors text-gray-600"
              aria-label="Abrir menú"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="3" y1="5" x2="17" y2="5" />
                <line x1="3" y1="10" x2="17" y2="10" />
                <line x1="3" y1="15" x2="17" y2="15" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider hidden sm:inline">
                Hidroverde
              </span>
              <span className="text-gray-200 hidden sm:inline">/</span>
              <span className="text-sm font-bold text-gray-800">{title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-300 font-mono hidden lg:inline">
              {window.location.origin}
            </span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-green-700"
              style={{ background: "linear-gradient(135deg, #dcfce7, #bbf7d0)" }}
            >
              HV
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 max-w-[1280px] w-full mx-auto animate-fade-in-up">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 text-center border-t border-gray-100">
          <span className="text-[11px] text-gray-300">
            Hidroverde Digital · Sistema de Gestión Hidropónica
          </span>
        </footer>
      </div>
    </div>
  );
}
