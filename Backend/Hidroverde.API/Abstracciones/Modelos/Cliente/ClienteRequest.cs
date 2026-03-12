using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace Abstracciones.Modelos.Cliente
{
    public class ClienteRequest
    {
        public string NombreRazonSocial { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public string Direccion { get; set; } = string.Empty;
        public string TipoCliente { get; set; } = string.Empty; // Ej: "Minorista", "Mayorista"
        public string? IdentificadorUnico { get; set; } // Cédula / RUC / etc.
    }
}