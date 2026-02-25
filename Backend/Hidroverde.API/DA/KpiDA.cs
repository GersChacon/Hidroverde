using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos.Kpi;
using Dapper;
using Microsoft.Data.SqlClient;

namespace DA
{
    public class KpiDA : IKpiDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public KpiDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<IEnumerable<KpiComparisonResponse>> ObtenerComparacion(string periodo, int? año, int? mes)
        {
            // Mock data for now
            var mock = new List<KpiComparisonResponse>
            {
                new KpiComparisonResponse { KpiName = "Cosechas (kg)", Actual = 1250, Target = 1500, Unit = "kg", Period = "Febrero 2025" },
                new KpiComparisonResponse { KpiName = "Ventas (₡)", Actual = 3250000, Target = 3000000, Unit = "₡", Period = "Febrero 2025" },
                new KpiComparisonResponse { KpiName = "Consumo agua (L)", Actual = 4500, Target = 4000, Unit = "L", Period = "Febrero 2025" }
            };
            return await Task.FromResult(mock);
        }
    }
}