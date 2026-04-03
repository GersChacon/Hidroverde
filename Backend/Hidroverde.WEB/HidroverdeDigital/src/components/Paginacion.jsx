export default function Paginacion({ pagina, totalPaginas, onChange }) {
  if (totalPaginas <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
      <span className="text-xs text-gray-400">
        Página {pagina} de {totalPaginas}
      </span>
      <div className="flex gap-1">
        <button
          disabled={pagina === 1}
          onClick={() => onChange(1)}
          className="px-2 py-1 rounded-lg text-xs font-bold border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-all"
        >«</button>
        <button
          disabled={pagina === 1}
          onClick={() => onChange(pagina - 1)}
          className="px-3 py-1 rounded-lg text-xs font-bold border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-all"
        >‹ Anterior</button>
        {Array.from({ length: totalPaginas }, (_, i) => i + 1)
          .filter(n => n === 1 || n === totalPaginas || Math.abs(n - pagina) <= 1)
          .reduce((acc, n, idx, arr) => {
            if (idx > 0 && n - arr[idx - 1] > 1) acc.push("...");
            acc.push(n);
            return acc;
          }, [])
          .map((n, i) =>
            n === "..." ? (
              <span key={`e${i}`} className="px-2 py-1 text-xs text-gray-400">…</span>
            ) : (
              <button key={n} onClick={() => onChange(n)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ` +
                  (n === pagina
                    ? "bg-green-100 border-green-300 text-green-800"
                    : "border-gray-200 hover:bg-gray-50 text-gray-600")}>
                {n}
              </button>
            )
          )}
        <button
          disabled={pagina === totalPaginas}
          onClick={() => onChange(pagina + 1)}
          className="px-3 py-1 rounded-lg text-xs font-bold border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-all"
        >Siguiente ›</button>
        <button
          disabled={pagina === totalPaginas}
          onClick={() => onChange(totalPaginas)}
          className="px-2 py-1 rounded-lg text-xs font-bold border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-all"
        >»</button>
      </div>
    </div>
  );
}
