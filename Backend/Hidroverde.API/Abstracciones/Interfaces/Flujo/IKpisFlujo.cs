using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.Flujo
{
    public interface IKpisFlujo
    {
        KpiResumenResponse ObtenerResumen(DateTime? fechaDesde, DateTime? fechaHasta);
    }
}
