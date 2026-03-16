using System;

namespace Abstracciones.Modelos
{
    public class ConsumoReporteResponse
    {
        public DateTime Periodo { get; set; }

        // Puede ser null si el consumo es operativo y no pertenece a ciclo
        public int? CicloId { get; set; }

        public int TipoRecursoId { get; set; }

        public string RecursoNombre { get; set; } = string.Empty;

        public string Unidad { get; set; } = string.Empty;

        // UNICO, SEMANAL, MENSUAL
        public string PeriodicidadCodigo { get; set; } = string.Empty;

        public decimal TotalCantidad { get; set; }
    }
}