using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abstracciones.Modelos;

namespace Abstracciones.Modelos
{
    public class ProveedorPendientePagoDto
    {
        public int ProveedorId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public decimal TotalCompras { get; set; }
        public decimal TotalPagado { get; set; }
        public decimal SaldoPendiente { get; set; }
        public string EstadoPago { get; set; } = string.Empty;
    }
}