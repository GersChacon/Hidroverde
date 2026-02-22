using Abstracciones.Interfaces.API;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TipoClienteController : ControllerBase, ITipoClienteController
    {
        private readonly ITipoClienteFlujo _tipoClienteFlujo;
        private readonly ILogger<TipoClienteController> _logger;

        public TipoClienteController(ITipoClienteFlujo tipoClienteFlujo, ILogger<TipoClienteController> logger)
        {
            _tipoClienteFlujo = tipoClienteFlujo;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Agregar(TipoClienteRequest tipoCliente)
        {
            var result = await _tipoClienteFlujo.Agregar(tipoCliente);
            return CreatedAtAction(nameof(Obtener), new { tipoClienteId = result }, result);
        }

        [HttpPut("{tipoClienteId:int}")]
        public async Task<IActionResult> Editar(int tipoClienteId, TipoClienteRequest tipoCliente)
        {
            var result = await _tipoClienteFlujo.Editar(tipoClienteId, tipoCliente);
            return Ok(result);
        }

        [HttpDelete("{tipoClienteId:int}")]
        public async Task<IActionResult> Eliminar(int tipoClienteId)
        {
            await _tipoClienteFlujo.Eliminar(tipoClienteId);
            return NoContent();
        }

        [HttpGet]
        public async Task<IActionResult> Obtener()
        {
            var result = await _tipoClienteFlujo.Obtener();
            return Ok(result);
        }

        [HttpGet("{tipoClienteId:int}")]
        public async Task<IActionResult> Obtener(int tipoClienteId)
        {
            var result = await _tipoClienteFlujo.Obtener(tipoClienteId);
            return result == null ? NotFound() : Ok(result);
        }
    }
}