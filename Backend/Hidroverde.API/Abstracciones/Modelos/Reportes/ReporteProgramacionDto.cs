using System;

namespace Abstracciones.Modelos.Reportes
{
    public class ReporteProgramacionDto
    {
        public int ProgramacionId { get; set; }
        public int ReporteId { get; set; }
        public string? ReporteNombre { get; set; }
        public string Frecuencia { get; set; } = string.Empty;
        public string? Parametros { get; set; }
        public DateTime ProximaEjecucion { get; set; }
        public int CreadoPor { get; set; }
        public bool Activo { get; set; }
        public DateTime FechaCreacion { get; set; }
    }
}