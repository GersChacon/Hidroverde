using Abstracciones.Interfaces.API;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EstadoVentaController : ControllerBase, IEstadoVentaController
    {
        private readonly IEstadoVentaFlujo _estadoVentaFlujo;
        private readonly ILogger<EstadoVentaController> _logger;

        public EstadoVentaController(IEstadoVentaFlujo estadoVentaFlujo, ILogger<EstadoVentaController> logger)
        {
            _estadoVentaFlujo = estadoVentaFlujo;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Agregar(EstadoVentaRequest estadoVenta)
        {
            var result = await _estadoVentaFlujo.Agregar(estadoVenta);
            return CreatedAtAction(nameof(Obtener), new { estadoVentaId = result }, result);
        }

        [HttpPut("{estadoVentaId}")]
        public async Task<IActionResult> Editar(int estadoVentaId, EstadoVentaRequest estadoVenta)
        {
            var result = await _estadoVentaFlujo.Editar(estadoVentaId, estadoVenta);
            return Ok(result);
        }

        [HttpDelete("{estadoVentaId}")]
        public async Task<IActionResult> Eliminar(int estadoVentaId)
        {
            var result = await _estadoVentaFlujo.Eliminar(estadoVentaId);
            return NoContent();
        }

        [HttpGet]
        public async Task<IActionResult> Obtener()
        {
            var result = await _estadoVentaFlujo.Obtener();
            return Ok(result);
        }

        [HttpGet("{estadoVentaId}")]
        public async Task<IActionResult> Obtener(int estadoVentaId)
        {
            var result = await _estadoVentaFlujo.Obtener(estadoVentaId);
            return result == null ? NotFound() : Ok(result);
        }
    }
}