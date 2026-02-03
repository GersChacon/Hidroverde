using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.Flujo
{
    public interface IAlertasFlujo
    {
        void GenerarAlertasStockBajo();
        AlertaBadgeDto ObtenerBadge();
        IEnumerable<AlertaActivaDto> ListarAlertasActivas();
        void AceptarAlerta(int alertaId, int empleadoId);
    }
}
