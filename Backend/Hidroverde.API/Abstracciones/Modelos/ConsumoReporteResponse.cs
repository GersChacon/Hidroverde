using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos
{
    public class ConsumoReporteResponse
    {
        public System.DateTime Periodo { get; set; }
        public string RecursoNombre { get; set; } = string.Empty;
        public string Unidad { get; set; } = string.Empty;
        public decimal TotalCantidad { get; set; }
    }
}