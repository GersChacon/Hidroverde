using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Abstracciones.Modelos.Kpi;

namespace Abstracciones.Interfaces.DA
{
    public interface IKpiDA
    {
        Task<IEnumerable<KpiComparisonResponse>> ObtenerComparacion(string periodo, int? año, int? mes);
    }
}