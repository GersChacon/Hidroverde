using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;

namespace Flujo
{
    public class KpisFlujo : IKpisFlujo
    {
        private readonly IKpisDA _kpisDA;

        public KpisFlujo(IKpisDA kpisDA)
        {
            _kpisDA = kpisDA;
        }

        public KpiResumenResponse ObtenerResumen(DateTime? fechaDesde, DateTime? fechaHasta)
        {
            return _kpisDA.ObtenerResumen(fechaDesde, fechaHasta);
        }
    }
}
