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
        public async Task<IActionResult> GetComparison(
            [FromQuery] string periodo = "mensual",
            [FromQuery] int? año = null,
            [FromQuery] int? mes = null)
        {
            try
            {
                // Validate mes if periodo is mensual
                if (periodo == "mensual" && mes.HasValue && (mes < 1 || mes > 12))
                {
                    return BadRequest(new { error = "Mes debe estar entre 1 y 12" });
                }

                var data = await _kpiFlujo.ObtenerComparacion(periodo, año, mes);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, details = ex.ToString() });
            }
        }
    }
}