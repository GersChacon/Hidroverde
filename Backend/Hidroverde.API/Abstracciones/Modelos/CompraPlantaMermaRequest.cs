using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos
{
    public class CompraPlantaMermaRequest
    {
        public int CompraDetalleId { get; set; }
        public int EmpleadoId { get; set; }
        public decimal CantidadMerma { get; set; }
        public string? Motivo { get; set; }
    }
}