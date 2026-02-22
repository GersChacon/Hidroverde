using Abstracciones.Interfaces.API;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EstadoPagoController : ControllerBase, IEstadoPagoController
    {
        private readonly IEstadoPagoFlujo _estadoPagoFlujo;
        private readonly ILogger<EstadoPagoController> _logger;

        public EstadoPagoController(IEstadoPagoFlujo estadoPagoFlujo, ILogger<EstadoPagoController> logger)
        {
            _estadoPagoFlujo = estadoPagoFlujo;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Agregar(EstadoPagoRequest estadoPago)
        {
            var result = await _estadoPagoFlujo.Agregar(estadoPago);
            return CreatedAtAction(nameof(Obtener), new { estadoPagoId = result }, result);
        }

        [HttpPut("{estadoPagoId:int}")]
        public async Task<IActionResult> Editar(int estadoPagoId, EstadoPagoRequest estadoPago)
        {
            var result = await _estadoPagoFlujo.Editar(estadoPagoId, estadoPago);
            return Ok(result);
        }

        [HttpDelete("{estadoPagoId:int}")]
        public async Task<IActionResult> Eliminar(int estadoPagoId)
        {
            await _estadoPagoFlujo.Eliminar(estadoPagoId);
            return NoContent();
        }

        [HttpGet]
        public async Task<IActionResult> Obtener()
        {
            var result = await _estadoPagoFlujo.Obtener();
            return Ok(result);
        }

        [HttpGet("{estadoPagoId:int}")]
        public async Task<IActionResult> Obtener(int estadoPagoId)
        {
            var result = await _estadoPagoFlujo.Obtener(estadoPagoId);
            return result == null ? NotFound() : Ok(result);
        }
    }
}