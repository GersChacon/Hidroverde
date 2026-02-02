using Abstracciones.Interfaces.API;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TipoCultivoController : ControllerBase, ITipoCultivoController
    {
        private readonly ITipoCultivoFlujo _tipoCultivoFlujo;
        private readonly ILogger<TipoCultivoController> _logger;

        public TipoCultivoController(ITipoCultivoFlujo tipoCultivoFlujo, ILogger<TipoCultivoController> logger)
        {
            _tipoCultivoFlujo = tipoCultivoFlujo;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Agregar(TipoCultivoRequest tipoCultivo)
        {
            var result = await _tipoCultivoFlujo.Agregar(tipoCultivo);
            return CreatedAtAction(nameof(Obtener), new { tipoCultivoId = result }, null);
        }

        [HttpPut("{tipoCultivoId}")]
        public async Task<IActionResult> Editar(int tipoCultivoId, TipoCultivoRequest tipoCultivo)
        {
            var result = await _tipoCultivoFlujo.Editar(tipoCultivoId, tipoCultivo);
            return Ok(result);
        }

        [HttpDelete("{tipoCultivoId}")]
        public async Task<IActionResult> Eliminar(int tipoCultivoId)
        {
            var result = await _tipoCultivoFlujo.Eliminar(tipoCultivoId);
            return NoContent();
        }

        [HttpGet]
        public async Task<IActionResult> Obtener()
        {
            var result = await _tipoCultivoFlujo.Obtener();
            if (!result.Any())
            {
                return NoContent();
            }
            return Ok(result);
        }

        [HttpGet("{tipoCultivoId}")]
        public async Task<IActionResult> Obtener(int tipoCultivoId)
        {
            var result = await _tipoCultivoFlujo.Obtener(tipoCultivoId);
            return Ok(result);
        }
    }
}