using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos
{
    public class ProveedorCompraMontoRequest
    {
        public int ProveedorId { get; set; }
        public decimal MontoCompra { get; set; }
    }
}