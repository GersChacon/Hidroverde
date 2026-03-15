using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.DA
{
    public interface IAlertasDA
    {
        Task GenerarAlertasStockBajo(); // changed to Task
        Task<AlertaBadgeDto> ObtenerBadge();
        Task<IEnumerable<AlertaActivaDto>> ListarAlertasActivas();
        Task AceptarAlerta(int alertaId, int empleadoId);
    }
}
