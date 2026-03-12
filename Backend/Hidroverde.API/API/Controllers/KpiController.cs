using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos.Kpi;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KpiController : ControllerBase
    {
        private readonly IKpiFlujo _kpiFlujo;

        public KpiController(IKpiFlujo kpiFlujo)
        {
            _kpiFlujo = kpiFlujo;
        }

        [HttpGet("comparison")]
        public async Task<IActionResult> GetComparison([FromQuery] string periodo = "mensual", [FromQuery] int? año = null, [FromQuery] int? mes = null)
        {
            try
            {
                var data = await _kpiFlujo.ObtenerComparacion(periodo, año, mes);
                return Ok(data);
            }
            catch (Exception)
            {
                // Mock data fallback
                var mock = GetMockKpis(periodo, año, mes);
                return Ok(mock);
            }
        }

        private IEnumerable<KpiComparisonResponse> GetMockKpis(string periodo, int? año, int? mes)
        {
            string periodText = periodo switch
            {
                "mensual" when mes.HasValue && año.HasValue => $"{GetMonthName(mes.Value)} {año}",
                "anual" when año.HasValue => $"Año {año}",
                _ => "Período actual"
            };

            return new List<KpiComparisonResponse>
            {
                new KpiComparisonResponse
                {
                    KpiName = "Cosechas (kg)",
                    Actual = 1250,
                    Target = 1500,
                    Unit = "kg",
                    Period = periodText
                },
                new KpiComparisonResponse
                {
                    KpiName = "Ventas (₡)",
                    Actual = 3250000,
                    Target = 3000000,
                    Unit = "₡",
                    Period = periodText
                },
                new KpiComparisonResponse
                {
                    KpiName = "Consumo agua (L)",
                    Actual = 4500,
                    Target = 4000,
                    Unit = "L",
                    Period = periodText
                },
                new KpiComparisonResponse
                {
                    KpiName = "Eficiencia (kg/L)",
                    Actual = 0.28m,
                    Target = 0.35m,
                    Unit = "kg/L",
                    Period = periodText
                }
            };
        }

        private string GetMonthName(int month) => month switch
        {
            1 => "Enero",
            2 => "Febrero",
            3 => "Marzo",
            4 => "Abril",
            5 => "Mayo",
            6 => "Junio",
            7 => "Julio",
            8 => "Agosto",
            9 => "Setiembre",
            10 => "Octubre",
            11 => "Noviembre",
            12 => "Diciembre",
            _ => "Mes " + month
        };
    }
}