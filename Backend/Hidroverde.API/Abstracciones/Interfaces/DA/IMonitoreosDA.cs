using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.DA
{
    public interface IMonitoreosDA
    {
        Task<int> Registrar(int responsableId, MonitoreoRegistrarRequest request);

        Task<IEnumerable<MonitoreoResponse>> Listar(int? cicloId, DateTime? fechaDesde, DateTime? fechaHasta);
    }
}
