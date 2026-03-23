using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class KpisController : ControllerBase
    {
        private readonly IKpisFlujo _kpisFlujo;

        public KpisController(IKpisFlujo kpisFlujo)
        {
            _kpisFlujo = kpisFlujo;
        }

        /// <summary>
        /// Devuelve totales y tendencia mensual de Cosechas, Ventas y Consumos
        /// para el período indicado. Si no se pasan fechas usa el mes actual.
        /// </summary>
        [HttpGet("resumen")]
        [ProducesResponseType(typeof(KpiResumenResponse), StatusCodes.Status200OK)]
        public ActionResult<KpiResumenResponse> Resumen(
            [FromQuery] DateTime? fechaDesde,
            [FromQuery] DateTime? fechaHasta)
        {
            var resultado = _kpisFlujo.ObtenerResumen(fechaDesde, fechaHasta);
            return Ok(resultado);
        }
    }
}
