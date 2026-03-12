using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos.Kpi;

namespace Flujo
{
    public class KpiFlujo : IKpiFlujo
    {
        private readonly IKpiDA _kpiDA;

        public KpiFlujo(IKpiDA kpiDA)
        {
            _kpiDA = kpiDA;
        }

        public async Task<IEnumerable<KpiComparisonResponse>> ObtenerComparacion(string periodo = "mensual", int? año = null, int? mes = null)
        {
            return await _kpiDA.ObtenerComparacion(periodo, año, mes);
        }
    }
}