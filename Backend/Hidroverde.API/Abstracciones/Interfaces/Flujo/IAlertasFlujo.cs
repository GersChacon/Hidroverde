using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.Flujo
{
    public interface IAlertasFlujo
    {
        Task GenerarAlertasStockBajo();
        Task<AlertaBadgeDto> ObtenerBadge();
        Task<IEnumerable<AlertaActivaDto>> ListarAlertasActivas();
        Task AceptarAlerta(int alertaId, int empleadoId);
    }
}