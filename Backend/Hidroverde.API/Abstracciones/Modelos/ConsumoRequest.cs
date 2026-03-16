using System;

namespace Abstracciones.Modelos
{
    public class ConsumoRequest
    {
        // Nullable:
        // null = consumo general / operativo
        // valor = consumo asociado a un ciclo específico
        public int? CicloId { get; set; }

        public int TipoRecursoId { get; set; }

        public decimal Cantidad { get; set; }

        public DateTime FechaConsumo { get; set; }

        // Valores esperados:
        // UNICO, SEMANAL, MENSUAL
        public string PeriodicidadCodigo { get; set; } = "UNICO";

        public string? Notas { get; set; }
    }
}