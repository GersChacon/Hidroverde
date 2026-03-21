using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos
{
    public class CompraPlantaRequest
    {
        public int ProveedorId { get; set; }
        public int EmpleadoId { get; set; }
        public string? NumeroFactura { get; set; }
        public DateTime? FechaCompra { get; set; }
        public decimal TotalFactura { get; set; }
        public string? Observaciones { get; set; }
    }
}