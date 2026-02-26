using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos.Plagas;
using Microsoft.AspNetCore.Mvc;

namespace Hidroverde.API.Controllers
{
    [ApiController]
    [Route("api/plagas")]
    public class PlagasController : ControllerBase
    {
        private readonly IPlagasFlujo _flujo;

        public PlagasController(IPlagasFlujo flujo)
        {
            _flujo = flujo;
        }

        [HttpGet("catalogo")]
        public async Task<IActionResult> Catalogo()
        {
            var data = await _flujo.CatalogoListar();
            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> Registrar([FromBody] PlagaRegistrarRequest request)
        {
            int empleadoId = 1; // temporal hasta auth real
            var id = await _flujo.Registrar(empleadoId, request);
            return Ok(new { registroId = id });
        }

        [HttpGet]
        public async Task<IActionResult> Listar(
            [FromQuery] DateTime? fechaDesde,
            [FromQuery] DateTime? fechaHasta,
            [FromQuery] int? plagaId)
        {
            var data = await _flujo.Listar(fechaDesde, fechaHasta, plagaId);
            return Ok(data);
        }

        [HttpGet("grafica")]
        public async Task<IActionResult> Grafica(
            [FromQuery] DateTime? fechaDesde,
            [FromQuery] DateTime? fechaHasta,
            [FromQuery] int? plagaId,
            [FromQuery] string agrupacion = "DIA")
        {
            agrupacion = (agrupacion ?? "DIA").Trim().ToUpperInvariant();
            if (agrupacion != "DIA" && agrupacion != "MES" && agrupacion != "ANIO")
                agrupacion = "DIA";

            var data = await _flujo.Grafica(fechaDesde, fechaHasta, plagaId, agrupacion);
            return Ok(data);
        }
    }
}