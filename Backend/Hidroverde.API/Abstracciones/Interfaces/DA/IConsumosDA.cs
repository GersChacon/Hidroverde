using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.DA
{
    public interface IConsumosDA
    {
        Task<long> Registrar(int empleadoId, ConsumoRequest request);
        Task<(long consumoId, int versionNo)> Editar(long consumoId, int empleadoId, ConsumoEditRequest request);

        Task<IEnumerable<ConsumoResponse>> Obtener(int? cicloId, DateTime? fechaDesde, DateTime? fechaHasta, int? tipoRecursoId);
        Task<IEnumerable<ConsumoHistorialResponse>> ObtenerHistorial(long consumoId);

        Task<IEnumerable<ConsumoReporteResponse>> ObtenerReporte(int cicloId, DateTime? fechaDesde, DateTime? fechaHasta, string granularidad);
        Task<IEnumerable<ConsumoReporteDiarioResponse>> ObtenerReporteDiario(
            int? cicloId,
            DateTime? fechaDesde,
            DateTime? fechaHasta,
            int? tipoRecursoId);
    }
}
