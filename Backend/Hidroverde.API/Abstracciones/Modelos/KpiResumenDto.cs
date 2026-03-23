namespace Abstracciones.Modelos
{
    public class KpiTotalDto
    {
        public string Kpi { get; set; }       // "cosechas" | "ventas" | "consumos"
        public decimal Valor { get; set; }
    }

    public class KpiTendenciaDto
    {
        public string Kpi { get; set; }
        public string Periodo { get; set; }   // "YYYY-MM"
        public decimal Valor { get; set; }
    }

    public class KpiResumenResponse
    {
        public IEnumerable<KpiTotalDto> Totales { get; set; }
        public IEnumerable<KpiTendenciaDto> Tendencia { get; set; }
    }
}
