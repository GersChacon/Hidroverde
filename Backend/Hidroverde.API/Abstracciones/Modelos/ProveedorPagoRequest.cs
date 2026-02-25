using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos
{
    public class ProveedorPagoRequest
    {
        public int ProveedorId { get; set; }
        public decimal MontoPago { get; set; }
    }
}