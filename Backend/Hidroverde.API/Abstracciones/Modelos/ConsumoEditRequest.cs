using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos
{
    public class ConsumoEditRequest
    {
        public decimal NuevaCantidad { get; set; }
        public System.DateTime NuevaFechaConsumo { get; set; }
        public string? Notas { get; set; }
        public string? MotivoCambio { get; set; }
    }
}