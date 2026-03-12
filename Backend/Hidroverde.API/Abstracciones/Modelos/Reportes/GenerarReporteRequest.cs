using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos.Reportes
{
    public class GenerarReporteRequest
    {
        public int ReporteId { get; set; }
        public string? Parametros { get; set; } // JSON
    }
}