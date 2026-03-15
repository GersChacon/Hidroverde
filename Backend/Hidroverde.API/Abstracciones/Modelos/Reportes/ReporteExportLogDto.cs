using System;

namespace Abstracciones.Modelos.Reportes
{
    public class ReporteExportLogDto
    {
        public int ExportId { get; set; }
        public int ReporteGeneradoId { get; set; }
        public int UsuarioId { get; set; }
        public DateTime FechaExport { get; set; }
        public string Formato { get; set; } = string.Empty;
    }
}