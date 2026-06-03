using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;

namespace Flujo
{
    public class MonitoreosFlujo : IMonitoreosFlujo
    {
        private readonly IMonitoreosDA _monitoreosDA;

        public MonitoreosFlujo(IMonitoreosDA monitoreosDA)
        {
            _monitoreosDA = monitoreosDA;
        }

        public async Task<int> Registrar(int responsableId, MonitoreoRegistrarRequest request)
        {
            return await _monitoreosDA.Registrar(responsableId, request);
        }

        public async Task<IEnumerable<MonitoreoResponse>> Listar(int? cicloId, DateTime? fechaDesde, DateTime? fechaHasta)
        {
            return await _monitoreosDA.Listar(cicloId, fechaDesde, fechaHasta);
        }
    }
}
