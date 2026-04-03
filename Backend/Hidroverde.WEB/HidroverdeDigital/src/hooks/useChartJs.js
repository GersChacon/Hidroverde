import { useEffect, useState } from "react";

export function useChartJs() {
  const [ready, setReady] = useState(!!window.Chart);

  useEffect(() => {
    if (window.Chart) { setReady(true); return; }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js";
    script.onload = () => setReady(true);
    script.onerror = () => console.error("No se pudo cargar Chart.js");
    document.head.appendChild(script);
  }, []);

  return ready;
}
