using Abstracciones.Interfaces.API;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

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
        public async Task<IActionResult> Agregar([FromBody] ProductoRequest producto)
        {
            if (producto == null) return BadRequest("Body requerido.");

            // Validaciones mínimas (evitan llegar a SQL con NULL/0)
            if (string.IsNullOrWhiteSpace(producto.Codigo))
                return BadRequest("Código es requerido.");

            if (string.IsNullOrWhiteSpace(producto.NombreProducto))
                return BadRequest("NombreProducto es requerido.");

            if (producto.VariedadId <= 0)
                return BadRequest("VariedadId inválido.");

            if (producto.UnidadId <= 0)
                return BadRequest("UnidadId inválido.");

            try
            {
                var idCreado = await _productoFlujo.Agregar(producto);

                // Si tienes un Obtener(productoId) en este controller, esto está bien
                return CreatedAtAction(nameof(Obtener), new { productoId = idCreado }, new { productoId = idCreado });
            }
            catch (SqlException ex) when (ex.Number == 51020 || ex.Number == 51021)
            {
                // Si usaste THROW en el SP para validaciones
                return BadRequest(ex.Message);
            }
            catch (SqlException ex)
            {
                // Error de DB/infra (constraints, tipos, etc.)
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("{productoId:int}")]
        public async Task<IActionResult> Editar([FromRoute] int productoId, [FromBody] ProductoRequest producto)
        {
            if (productoId <= 0) return BadRequest("productoId inválido.");
            if (producto == null) return BadRequest("Body requerido.");

            if (string.IsNullOrWhiteSpace(producto.Codigo))
                return BadRequest("Código es requerido.");

            if (string.IsNullOrWhiteSpace(producto.NombreProducto))
                return BadRequest("NombreProducto es requerido.");

            if (producto.VariedadId <= 0)
                return BadRequest("VariedadId inválido.");

            if (producto.UnidadId <= 0)
                return BadRequest("UnidadId inválido.");

            try
            {
                var result = await _productoFlujo.Editar(productoId, producto);
                return Ok(result);
            }
            catch (SqlException ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("{productoId:int}")]
        public async Task<IActionResult> Eliminar(int productoId)
        {
            try
            {
                await _productoFlujo.Eliminar(productoId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (SqlException ex)
            {
                return StatusCode(500, ex.Message);
            }
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