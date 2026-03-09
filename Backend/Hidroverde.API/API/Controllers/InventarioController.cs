using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/inventario")]
    public class InventarioController : ControllerBase
    {
        private readonly IInventarioFlujo _flujo;

        public InventarioController(IInventarioFlujo flujo)
        {
            _flujo = flujo;
        }

        [HttpGet("actual")]
        public async Task<IActionResult> ListarActual(
            [FromQuery] int? cicloOrigenId,
            [FromQuery] int? productoId,
            [FromQuery] string? productoNombre,
            [FromQuery] string? lote,
            [FromQuery] DateTime? desde,
            [FromQuery] DateTime? hasta,
            [FromQuery] bool soloDisponibles = true
        )
        {
            var data = (await _flujo.ListarActual(
                cicloOrigenId,
                productoId,
                productoNombre,
                lote,
                desde,
                hasta,
                soloDisponibles
            ))?.ToList() ?? new List<InventarioActualResponse>();

            return Ok(data);
        }

        [HttpGet("actual/{inventarioId:int}")]
        public async Task<IActionResult> ObtenerActualPorId([FromRoute] int inventarioId)
        {
            if (inventarioId <= 0) return BadRequest("inventarioId inválido.");

            var item = await _flujo.ObtenerActualPorId(inventarioId);
            return item == null ? NotFound() : Ok(item);
        }

        [HttpGet("movimientos")]
        public async Task<IActionResult> ListarMovimientos(
            [FromQuery] int inventarioId,
            [FromQuery] DateTime? desde,
            [FromQuery] DateTime? hasta
        )
        {
            if (inventarioId <= 0) return BadRequest("inventarioId inválido.");

            var data = (await _flujo.ListarMovimientos(inventarioId, desde, hasta))?.ToList() ?? new();
            return Ok(data);
        }
    }
}