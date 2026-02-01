using Abstracciones.Interfaces.API;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UnidadMedidaController : ControllerBase, IUnidadMedidaController
    {
        private readonly IUnidadMedidaFlujo _unidadMedidaFlujo;
        private readonly ILogger<UnidadMedidaController> _logger;

        public UnidadMedidaController(IUnidadMedidaFlujo unidadMedidaFlujo, ILogger<UnidadMedidaController> logger)
        {
            _unidadMedidaFlujo = unidadMedidaFlujo;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Agregar(UnidadMedidaRequest unidadMedida)
        {
            var result = await _unidadMedidaFlujo.Agregar(unidadMedida);
            return CreatedAtAction(nameof(Obtener), new { unidadId = result }, null);
        }

        [HttpPut("{unidadId}")]
        public async Task<IActionResult> Editar(int unidadId, UnidadMedidaRequest unidadMedida)
        {
            var result = await _unidadMedidaFlujo.Editar(unidadId, unidadMedida);
            return Ok(result);
        }

        [HttpDelete("{unidadId}")]
        public async Task<IActionResult> Eliminar(int unidadId)
        {
            var result = await _unidadMedidaFlujo.Eliminar(unidadId);
            return NoContent();
        }

        [HttpGet]
        public async Task<IActionResult> Obtener()
        {
            var result = await _unidadMedidaFlujo.Obtener();
            if (!result.Any())
            {
                return NoContent();
            }
            return Ok(result);
        }

        [HttpGet("{unidadId}")]
        public async Task<IActionResult> Obtener(int unidadId)
        {
            var result = await _unidadMedidaFlujo.Obtener(unidadId);
            return Ok(result);
        }
    }
}