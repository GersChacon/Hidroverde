// Models/Alerta.cs
using System;

namespace HidroverdeDigital.Models
{
    public class Alerta
    {
        public int AlertaId { get; set; }
        public string TipoAlerta { get; set; } = string.Empty;
        public string Mensaje { get; set; } = string.Empty;
        public string Estado { get; set; } = "ACTIVA";
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaAceptada { get; set; }
        public int? UsuarioAceptaId { get; set; }

        // Optional relation to Producto (matches ApplicationDbContext configuration)
        public int? ProductoId { get; set; }
        public Producto? Producto { get; set; }
    }
}