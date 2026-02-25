using Abstracciones.Interfaces.API;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TipoEntregaController : ControllerBase, ITipoEntregaController
    {
        private readonly ITipoEntregaFlujo _tipoEntregaFlujo;
        private readonly ILogger<TipoEntregaController> _logger;

        public TipoEntregaController(ITipoEntregaFlujo tipoEntregaFlujo, ILogger<TipoEntregaController> logger)
        {
            _tipoEntregaFlujo = tipoEntregaFlujo;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Agregar(TipoEntregaRequest tipoEntrega)
        {
            var result = await _tipoEntregaFlujo.Agregar(tipoEntrega);
            return CreatedAtAction(nameof(Obtener), new { tipoEntregaId = result }, result);
        }

        [HttpPut("{tipoEntregaId}")]
        public async Task<IActionResult> Editar(int tipoEntregaId, TipoEntregaRequest tipoEntrega)
        {
            var result = await _tipoEntregaFlujo.Editar(tipoEntregaId, tipoEntrega);
            return Ok(result);
        }

        [HttpDelete("{tipoEntregaId}")]
        public async Task<IActionResult> Eliminar(int tipoEntregaId)
        {
            var result = await _tipoEntregaFlujo.Eliminar(tipoEntregaId);
            return NoContent();
        }

        [HttpGet]
        public async Task<IActionResult> Obtener()
        {
            var result = await _tipoEntregaFlujo.Obtener();
            return Ok(result);
        }

        [HttpGet("{tipoEntregaId}")]
        public async Task<IActionResult> Obtener(int tipoEntregaId)
        {
            var result = await _tipoEntregaFlujo.Obtener(tipoEntregaId);
            return result == null ? NotFound() : Ok(result);
        }
    }
}