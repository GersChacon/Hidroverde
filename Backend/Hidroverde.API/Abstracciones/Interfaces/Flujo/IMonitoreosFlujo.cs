using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.Flujo
{
    public interface IMonitoreosFlujo
    {
        Task<int> Registrar(int responsableId, MonitoreoRegistrarRequest request);

        Task<IEnumerable<MonitoreoResponse>> Listar(int? cicloId, DateTime? fechaDesde, DateTime? fechaHasta);
    }
}
