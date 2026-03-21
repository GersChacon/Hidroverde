using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos
{
    public class CompraDetalleMermaResponse
    {
        public int CompraDetalleId { get; set; }
        public int ProductoId { get; set; }
        public string NombreProducto { get; set; } = string.Empty;
        public int ProveedorId { get; set; }
        public string ProveedorNombre { get; set; } = string.Empty;
        public decimal CantidadComprada { get; set; }
        public decimal CantidadMermaActual { get; set; }
        public decimal CantidadDisponibleParaMerma { get; set; }
    }
}