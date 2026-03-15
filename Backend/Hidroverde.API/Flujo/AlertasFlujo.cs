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

        public async Task<AlertaBadgeDto> ObtenerBadge() => await _alertasDA.ObtenerBadge();
        public async Task<IEnumerable<AlertaActivaDto>> ListarAlertasActivas() => await _alertasDA.ListarAlertasActivas();
        public async Task AceptarAlerta(int alertaId, int empleadoId) => await _alertasDA.AceptarAlerta(alertaId, empleadoId);
        public async Task GenerarAlertasStockBajo() => await _alertasDA.GenerarAlertasStockBajo();
    }
}