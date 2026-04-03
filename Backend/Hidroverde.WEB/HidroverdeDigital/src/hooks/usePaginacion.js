import { useState, useMemo } from "react";

const POR_PAGINA = 10;

export function usePaginacion(items = [], porPagina = POR_PAGINA) {
  const [pagina, setPagina] = useState(1);

  const totalPaginas = Math.max(1, Math.ceil(items.length / porPagina));

  // Reset a página 1 si los items cambian y la página actual queda fuera de rango
  const paginaActual = Math.min(pagina, totalPaginas);

  const paginados = useMemo(() => {
    const inicio = (paginaActual - 1) * porPagina;
    return items.slice(inicio, inicio + porPagina);
  }, [items, paginaActual, porPagina]);

  return {
    paginados,
    pagina: paginaActual,
    totalPaginas,
    setPagina,
    total: items.length,
  };
}
