using System;

namespace Abstracciones.Modelos.Reportes
{
    public class ReporteDefinicionDto
    {
        public int ReporteId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public string Procedimiento { get; set; } = string.Empty;
        public string? ParametrosJson { get; set; }
        public string? RolesPermitidos { get; set; }
        public bool Activo { get; set; }
        public DateTime FechaCreacion { get; set; }
    }
}