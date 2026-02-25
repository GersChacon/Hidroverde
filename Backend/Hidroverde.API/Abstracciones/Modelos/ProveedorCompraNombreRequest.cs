using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos
{
    public class ProveedorCompraNombreRequest
    {
        public string NombreProveedor { get; set; } = string.Empty;
        public decimal MontoCompra { get; set; }
    }
}