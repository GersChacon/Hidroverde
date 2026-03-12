using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos.Reportes
{
    public class ReporteGeneradoDto
    {
        public int GeneradoId { get; set; }
        public int ReporteId { get; set; }
        public string? ReporteNombre { get; set; }
        public DateTime FechaGeneracion { get; set; }
        public string DatosJson { get; set; } = string.Empty;
        public int? ProgramacionId { get; set; }
    }
}