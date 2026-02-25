using Abstracciones.Interfaces.API;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MetodoPagoController : ControllerBase, IMetodoPagoController
    {
        private readonly IMetodoPagoFlujo _metodoPagoFlujo;
        private readonly ILogger<MetodoPagoController> _logger;

        public MetodoPagoController(IMetodoPagoFlujo metodoPagoFlujo, ILogger<MetodoPagoController> logger)
        {
            _metodoPagoFlujo = metodoPagoFlujo;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Agregar(MetodoPagoRequest metodoPago)
        {
            var result = await _metodoPagoFlujo.Agregar(metodoPago);
            return CreatedAtAction(nameof(Obtener), new { metodoPagoId = result }, result);
        }

        [HttpPut("{metodoPagoId}")]
        public async Task<IActionResult> Editar(int metodoPagoId, MetodoPagoRequest metodoPago)
        {
            var result = await _metodoPagoFlujo.Editar(metodoPagoId, metodoPago);
            return Ok(result);
        }

        [HttpDelete("{metodoPagoId}")]
        public async Task<IActionResult> Eliminar(int metodoPagoId)
        {
            var result = await _metodoPagoFlujo.Eliminar(metodoPagoId);
            return NoContent();
        }

        [HttpGet]
        public async Task<IActionResult> Obtener()
        {
            var result = await _metodoPagoFlujo.Obtener();
            return Ok(result);
        }

        [HttpGet("{metodoPagoId}")]
        public async Task<IActionResult> Obtener(int metodoPagoId)
        {
            var result = await _metodoPagoFlujo.Obtener(metodoPagoId);
            return result == null ? NotFound() : Ok(result);
        }
    }
}