const MAP = {
  // Estados de venta
  pendiente:    "bg-yellow-100 text-yellow-700 border-yellow-200",
  "en proceso": "bg-blue-100 text-blue-700 border-blue-200",
  entregado:    "bg-green-100 text-green-700 border-green-200",
  cancelado:    "bg-red-100 text-red-600 border-red-200",
  "en ruta":    "bg-indigo-100 text-indigo-700 border-indigo-200",
  // Estados de pago
  pagado:       "bg-green-100 text-green-700 border-green-200",
  "pendiente de pago": "bg-yellow-100 text-yellow-700 border-yellow-200",
  // Inventario
  activo:       "bg-green-100 text-green-700 border-green-200",
  inactivo:     "bg-gray-100 text-gray-500 border-gray-200",
  ok:           "bg-green-100 text-green-700 border-green-200",
};

export default function StatusBadge({ label, variant }) {
  const key = (variant ?? label ?? "").toLowerCase();
  const cls = MAP[key] ?? "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border inline-block ${cls}`}>
      {label}
    </span>
  );
}
