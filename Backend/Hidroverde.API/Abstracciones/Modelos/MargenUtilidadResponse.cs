using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos
{
    public class MargenUtilidadResponse
    {
        public int ProductoId { get; set; }
        public string NombreProducto { get; set; } = string.Empty;

        public int ProveedorId { get; set; }
        public string ProveedorNombre { get; set; } = string.Empty;

        public decimal CantidadComprada { get; set; }
        public decimal CantidadMerma { get; set; }
        public decimal CantidadUtil { get; set; }

        public decimal CostoTotal { get; set; }
        public decimal CostoUnitarioInicial { get; set; }
        public decimal CostoUnitarioReal { get; set; }

        public decimal PrecioBase { get; set; }
        public decimal MargenUnitario { get; set; }
        public decimal MargenPorcentaje { get; set; }
    }
}