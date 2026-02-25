using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos.Kpi
{
    public class KpiComparisonResponse
    {
        public string KpiName { get; set; } = string.Empty;
        public decimal Actual { get; set; }
        public decimal Target { get; set; }
        public decimal Percentage => Target == 0 ? 0 : Math.Round((Actual / Target) * 100, 1);
        public string Unit { get; set; } = string.Empty;
        public string Period { get; set; } = string.Empty; // ej. "Enero 2025"
    }
}