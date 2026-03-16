using System;

namespace Abstracciones.Modelos
{
    public class ConsumoReporteDiarioResponse
    {
        public DateTime Fecha { get; set; }

        // Nullable porque el consumo puede ser general
        public int? CicloId { get; set; }

        public int TipoRecursoId { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string RecursoNombre { get; set; } = string.Empty;
        public string Unidad { get; set; } = string.Empty;

        // UNICO, SEMANAL, MENSUAL
        public string PeriodicidadCodigo { get; set; } = string.Empty;

        public decimal TotalCantidad { get; set; }
    }
}