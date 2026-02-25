using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos
{
    public class ProveedorPagoResponse
    {
        public int ProveedorId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public decimal TotalCompras { get; set; }
        public decimal TotalPagado { get; set; }
        public decimal SaldoPendiente { get; set; }
        public string EstadoPago { get; set; } = string.Empty;

        public string Mensaje { get; set; } = string.Empty; // warning o confirmación
    }
}