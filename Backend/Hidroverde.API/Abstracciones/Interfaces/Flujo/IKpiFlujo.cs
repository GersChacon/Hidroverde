using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Abstracciones.Modelos.Kpi;

namespace Abstracciones.Interfaces.Flujo
{
    public interface IKpiFlujo
    {
        Task<IEnumerable<KpiComparisonResponse>> ObtenerComparacion(string periodo = "mensual", int? año = null, int? mes = null);
    }
}   