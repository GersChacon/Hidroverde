using Abstracciones.Interfaces.API;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriaController : ControllerBase, ICategoriaController
    {
        private readonly ICategoriaFlujo _categoriaFlujo;
        private readonly ILogger<CategoriaController> _logger;

        public CategoriaController(ICategoriaFlujo categoriaFlujo, ILogger<CategoriaController> logger)
        {
            _categoriaFlujo = categoriaFlujo;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Agregar(CategoriaRequest categoria)
        {
            var result = await _categoriaFlujo.Agregar(categoria);
            return CreatedAtAction(nameof(Obtener), new { categoriaId = result }, null);
        }

        [HttpPut("{categoriaId}")]
        public async Task<IActionResult> Editar(int categoriaId, CategoriaRequest categoria)
        {
            var result = await _categoriaFlujo.Editar(categoriaId, categoria);
            return Ok(result);
        }

        [HttpDelete("{categoriaId}")]
        public async Task<IActionResult> Eliminar(int categoriaId)
        {
            var result = await _categoriaFlujo.Eliminar(categoriaId);
            return NoContent();
        }

        [HttpGet]
        public async Task<IActionResult> Obtener()
        {
            var result = await _categoriaFlujo.Obtener();
            if (!result.Any())
            {
                return NoContent();
            }
            return Ok(result);
        }

        [HttpGet("{categoriaId}")]
        public async Task<IActionResult> Obtener(int categoriaId)
        {
            var result = await _categoriaFlujo.Obtener(categoriaId);
            return Ok(result);
        }
    }
}