using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.DA
{
    public interface IAlertasDA
    {
        void GenerarAlertasStockBajo();
        AlertaBadgeDto ObtenerBadge();
        IEnumerable<AlertaActivaDto> ListarAlertasActivas();
        void AceptarAlerta(int alertaId, int empleadoId);
    }
}
