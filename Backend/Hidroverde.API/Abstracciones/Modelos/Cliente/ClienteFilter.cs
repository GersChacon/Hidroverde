using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos.Cliente
{
    public class ClienteFilter
    {
        public string? TipoCliente { get; set; }
        public string? Ubicacion { get; set; } // Podría ser provincia o ciudad
        public bool? Activo { get; set; }
    }
}