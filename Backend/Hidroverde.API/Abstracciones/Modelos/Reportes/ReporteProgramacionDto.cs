using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos.Reportes
{
    public class ReporteProgramacionDto
    {
        public int ProgramacionId { get; set; }
        public int ReporteId { get; set; }
        public string? ReporteNombre { get; set; }
        public string Frecuencia { get; set; } = string.Empty; // DIARIO, SEMANAL, MENSUAL
        public string? Parametros { get; set; } // JSON
        public DateTime ProximaEjecucion { get; set; }
        public int CreadoPor { get; set; }
        public bool Activo { get; set; }
        public DateTime FechaCreacion { get; set; }
    }
}