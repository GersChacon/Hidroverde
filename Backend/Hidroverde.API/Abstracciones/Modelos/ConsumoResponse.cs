using System;

namespace Abstracciones.Modelos
{
    public class ConsumoResponse
    {
        public long ConsumoId { get; set; }

        // Nullable: puede no existir si es consumo general
        public int? CicloId { get; set; }

        public int TipoRecursoId { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string RecursoNombre { get; set; } = string.Empty;
        public string Categoria { get; set; } = string.Empty;
        public string Unidad { get; set; } = string.Empty;

        public int VersionNo { get; set; }
        public decimal Cantidad { get; set; }
        public DateTime FechaConsumo { get; set; }

        // UNICO, SEMANAL, MENSUAL
        public string PeriodicidadCodigo { get; set; } = string.Empty;

        public string? Notas { get; set; }
        public DateTime FechaRegistro { get; set; }
        public int RegistradoPorEmpleadoId { get; set; }

        public string? RegistradoPorNombre { get; set; }
    }
}