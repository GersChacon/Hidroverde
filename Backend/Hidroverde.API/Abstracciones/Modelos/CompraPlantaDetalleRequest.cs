using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos
{
    public class CompraPlantaDetalleRequest
    {
        public int CompraId { get; set; }
        public int ProductoId { get; set; }
        public int UnidadId { get; set; }
        public decimal CantidadComprada { get; set; }
        public decimal CostoTotalLinea { get; set; }
        public string? Observaciones { get; set; }
    }
}