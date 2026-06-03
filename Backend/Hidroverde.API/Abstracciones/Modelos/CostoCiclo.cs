using System.Collections.Generic;

namespace Abstracciones.Modelos
{
    // Costo de producción de un ciclo, calculado desde los consumos vigentes.
    public class CostoCicloResponse
    {
        public int CicloId { get; set; }
        public decimal CostoTotal { get; set; }
        public int CantidadConsumos { get; set; }
        public List<CostoCicloDetalle> Detalle { get; set; } = new();
    }

    public class CostoCicloDetalle
    {
        public int TipoRecursoId { get; set; }
        public string RecursoNombre { get; set; } = string.Empty;
        public string Unidad { get; set; } = string.Empty;
        public decimal CostoUnitario { get; set; }
        public decimal Cantidad { get; set; }
        public decimal Costo { get; set; }
    }

    public class ActualizarCostoRequest
    {
        public decimal CostoUnitario { get; set; }
    }
}
