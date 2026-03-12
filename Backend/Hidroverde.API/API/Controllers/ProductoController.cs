using Abstracciones.Interfaces.API;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductoController : ControllerBase, IProductoController
    {
        private readonly IProductoFlujo _productoFlujo;
        private readonly ILogger<ProductoController> _logger;

        public ProductoController(IProductoFlujo productoFlujo, ILogger<ProductoController> logger)
        {
            _productoFlujo = productoFlujo;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Agregar(ProductoRequest producto)
        {
            var result = await _productoFlujo.Agregar(producto);
            return CreatedAtAction(nameof(Obtener), new { productoId = result }, result);
        }

        [HttpPut("{productoId}")]
        public async Task<IActionResult> Editar(int productoId, ProductoRequest producto)
        {
            var result = await _productoFlujo.Editar(productoId, producto);
            return Ok(result);
        }

        [HttpDelete("{productoId}")]
        public async Task<IActionResult> Eliminar(int productoId)
        {
            var result = await _productoFlujo.Eliminar(productoId);
            return NoContent();
        }

        [HttpGet]
        public async Task<IActionResult> Obtener()
        {
            var result = await _productoFlujo.Obtener();
            return Ok(result);
        }

        [HttpGet("{productoId}")]
        public async Task<IActionResult> Obtener(int productoId)
        {
            var result = await _productoFlujo.Obtener(productoId);
            return result == null ? NotFound() : Ok(result);
        }
    }
}