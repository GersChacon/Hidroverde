using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;

namespace Flujo
{
    public class ConsumosFlujo : IConsumosFlujo
    {
        private readonly IConsumosDA _consumosDA;

        public ConsumosFlujo(IConsumosDA consumosDA)
        {
            _consumosDA = consumosDA;
        }

        public async Task<long> Registrar(int empleadoId, ConsumoRequest request)
        {
            return await _consumosDA.Registrar(empleadoId, request);
        }

        public async Task<(long consumoId, int versionNo)> Editar(
            long consumoId,
            int empleadoId,
            ConsumoEditRequest request
        )
        {
            return await _consumosDA.Editar(consumoId, empleadoId, request);
        }

        public async Task<IEnumerable<ConsumoResponse>> Obtener(
            int? cicloId,
            DateTime? fechaDesde,
            DateTime? fechaHasta,
            int? tipoRecursoId
        )
        {
            return await _consumosDA.Obtener(cicloId, fechaDesde, fechaHasta, tipoRecursoId);
        }

        public async Task<IEnumerable<ConsumoHistorialResponse>> ObtenerHistorial(long consumoId)
        {
            return await _consumosDA.ObtenerHistorial(consumoId);
        }

        public async Task<IEnumerable<ConsumoReporteResponse>> ObtenerReporte(
            int? cicloId,
            DateTime? fechaDesde,
            DateTime? fechaHasta,
            string granularidad
        )
        {
            return await _consumosDA.ObtenerReporte(cicloId, fechaDesde, fechaHasta, granularidad);
        }

        public async Task<IEnumerable<ConsumoReporteDiarioResponse>> ObtenerReporteDiario(
            int? cicloId,
            DateTime? fechaDesde,
            DateTime? fechaHasta,
            int? tipoRecursoId
        )
        {
            return await _consumosDA.ObtenerReporteDiario(cicloId, fechaDesde, fechaHasta, tipoRecursoId);
        }

        public async Task<IEnumerable<TipoRecursoResponse>> ObtenerTiposRecurso()
        {
            return await _consumosDA.ObtenerTiposRecurso();
        }
    }
}