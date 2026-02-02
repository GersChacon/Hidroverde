using Abstracciones.Interfaces.API;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VariedadController : ControllerBase, IVariedadController
    {
        private readonly IVariedadFlujo _variedadFlujo;
        private readonly ILogger<VariedadController> _logger;

        public VariedadController(IVariedadFlujo variedadFlujo, ILogger<VariedadController> logger)
        {
            _variedadFlujo = variedadFlujo;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Agregar(VariedadRequest variedad)
        {
            var result = await _variedadFlujo.Agregar(variedad);
            return CreatedAtAction(nameof(Obtener), new { variedadId = result }, null);
        }

        [HttpPut("{variedadId}")]
        public async Task<IActionResult> Editar(int variedadId, VariedadRequest variedad)
        {
            var result = await _variedadFlujo.Editar(variedadId, variedad);
            return Ok(result);
        }

        [HttpDelete("{variedadId}")]
        public async Task<IActionResult> Eliminar(int variedadId)
        {
            var result = await _variedadFlujo.Eliminar(variedadId);
            return NoContent();
        }

        [HttpGet]
        public async Task<IActionResult> Obtener()
        {
            var result = await _variedadFlujo.Obtener();
            if (!result.Any())
            {
                return NoContent();
            }
            return Ok(result);
        }

        [HttpGet("{variedadId}")]
        public async Task<IActionResult> Obtener(int variedadId)
        {
            var result = await _variedadFlujo.Obtener(variedadId);
            return Ok(result);
        }
    }
}