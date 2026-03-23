using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.DA
{
    public interface IKpisDA
    {
        KpiResumenResponse ObtenerResumen(DateTime? fechaDesde, DateTime? fechaHasta);
    }
}
