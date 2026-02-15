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
            if (empleadoId <= 0) throw new Exception("EmpleadoId inválido.");
            if (request.CicloId <= 0) throw new Exception("CicloId inválido.");
            if (request.TipoRecursoId <= 0) throw new Exception("TipoRecursoId inválido.");
            if (request.Cantidad <= 0) throw new Exception("La cantidad debe ser mayor a 0.");

            return await _consumosDA.Registrar(empleadoId, request);
        }

        public async Task<(long consumoId, int versionNo)> Editar(long consumoId, int empleadoId, ConsumoEditRequest request)
        {
            if (consumoId <= 0) throw new Exception("ConsumoId inválido.");
            if (empleadoId <= 0) throw new Exception("EmpleadoId inválido.");
            if (request.NuevaCantidad <= 0) throw new Exception("La cantidad debe ser mayor a 0.");

            return await _consumosDA.Editar(consumoId, empleadoId, request);
        }

        public async Task<IEnumerable<ConsumoResponse>> Obtener(int? cicloId, DateTime? fechaDesde, DateTime? fechaHasta, int? tipoRecursoId)
        {
            return await _consumosDA.Obtener(cicloId, fechaDesde, fechaHasta, tipoRecursoId);
        }

        public async Task<IEnumerable<ConsumoHistorialResponse>> ObtenerHistorial(long consumoId)
        {
            return await _consumosDA.ObtenerHistorial(consumoId);
        }

        public async Task<IEnumerable<ConsumoReporteResponse>> ObtenerReporte(int cicloId, DateTime? fechaDesde, DateTime? fechaHasta, string granularidad)
        {
            if (cicloId <= 0) throw new Exception("CicloId inválido.");

            var g = (granularidad ?? "DIA").Trim().ToUpperInvariant();
            if (g != "DIA" && g != "MES") throw new Exception("Granularidad inválida. Use DIA o MES.");

            return await _consumosDA.ObtenerReporte(cicloId, fechaDesde, fechaHasta, g);
        }
        public async Task<IEnumerable<ConsumoReporteDiarioResponse>> ObtenerReporteDiario(
            int? cicloId,
            DateTime? fechaDesde,
            DateTime? fechaHasta,
            int? tipoRecursoId)
        {
            // Regla mínima: si vienen fechas, deben ser coherentes
            if (fechaDesde.HasValue && fechaHasta.HasValue && fechaDesde.Value.Date > fechaHasta.Value.Date)
                throw new Exception("fechaDesde no puede ser mayor que fechaHasta.");

            return await _consumosDA.ObtenerReporteDiario(cicloId, fechaDesde, fechaHasta, tipoRecursoId);
        }
    }
}
