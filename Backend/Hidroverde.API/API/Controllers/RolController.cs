// RolController.cs
using Abstracciones.Interfaces.API;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolController : ControllerBase, IRolController
    {
        private readonly IRolFlujo _rolFlujo;
        private readonly ILogger<RolController> _logger;

        public RolController(IRolFlujo rolFlujo, ILogger<RolController> logger)
        {
            _rolFlujo = rolFlujo;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Agregar(RolRequest rol)
        {
            var result = await _rolFlujo.Agregar(rol);
            return CreatedAtAction(nameof(Obtener), new { rolId = result }, result);
        }

        [HttpPut("{rolId:int}")]
        public async Task<IActionResult> Editar(int rolId, RolRequest rol)
        {
            var result = await _rolFlujo.Editar(rolId, rol);
            return Ok(result);
        }

        [HttpDelete("{rolId:int}")]
        public async Task<IActionResult> Eliminar(int rolId)
        {
            await _rolFlujo.Eliminar(rolId);
            return NoContent();
        }

        [HttpGet]
        public async Task<IActionResult> Obtener()
        {
            var result = await _rolFlujo.Obtener();
            return Ok(result);
        }

        [HttpGet("{rolId:int}")]
        public async Task<IActionResult> Obtener(int rolId)
        {
            var result = await _rolFlujo.Obtener(rolId);
            return result == null ? NotFound() : Ok(result);
        }
    }
}