using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;

namespace Flujo
{
    public class AlertasFlujo : IAlertasFlujo
    {
        private readonly IAlertasDA _alertasDA;

        public AlertasFlujo(IAlertasDA alertasDA)
        {
            _alertasDA = alertasDA;
        }

        public AlertaBadgeDto ObtenerBadge()
        {
            return _alertasDA.ObtenerBadge();
        }

        public IEnumerable<AlertaActivaDto> ListarAlertasActivas()
        {
            return _alertasDA.ListarAlertasActivas();
        }

        public void AceptarAlerta(int alertaId, int empleadoId)
        {
            _alertasDA.AceptarAlerta(alertaId, empleadoId);
        }
        public void GenerarAlertasStockBajo()
        {
            _alertasDA.GenerarAlertasStockBajo();
        }
    }
}
