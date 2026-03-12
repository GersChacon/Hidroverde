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
            if (producto == null) return BadRequest("Body requerido.");

            // ✅ Nombre obligatorio
            if (string.IsNullOrWhiteSpace(producto.NombreProducto))
                return BadRequest("NombreProducto es requerido.");

            // ✅ Unidad obligatoria (viene del dropdown)
            if (producto.UnidadId <= 0)
                return BadRequest("UnidadId inválido.");

            // ✅ Código: ya NO es obligatorio (lo genera la DB/SP)
            // Si te llega algo con espacios, lo normalizamos; si está vacío, lo dejamos null.
            producto.Codigo = string.IsNullOrWhiteSpace(producto.Codigo)
                ? null
                : producto.Codigo.Trim();

            // ✅ Variedad: default (por ahora)
            // Ajusta el "1" al id real de tu variedad default.
            if (producto.VariedadId <= 0)
                producto.VariedadId = 1;

            try
            {
                var idCreado = await _productoFlujo.Agregar(producto);
                return CreatedAtAction(nameof(Obtener), new { productoId = idCreado }, new { productoId = idCreado });
            }
            catch (SqlException ex) when (ex.Number == 51020 || ex.Number == 51021)
            {
                return BadRequest(ex.Message);
            }
            catch (SqlException ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("{productoId}")]
        public async Task<IActionResult> Editar(int productoId, ProductoRequest producto)
        {
            var result = await _productoFlujo.Editar(productoId, producto);
            return Ok(result);
            if (productoId <= 0) return BadRequest("productoId inválido.");
            if (producto == null) return BadRequest("Body requerido.");

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

        [HttpDelete("{productoId}")]
        public async Task<IActionResult> Eliminar(int productoId)
        {
            var result = await _productoFlujo.Eliminar(productoId);
            return NoContent();
            try
            {
                await _productoFlujo.Eliminar(productoId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (SqlException ex) when (ex.Number == 51030)
            {
                return Conflict(ex.Message); // 409
            }
            catch (SqlException ex) when (ex.Number == 51031)
            {
                return NotFound(ex.Message); // 404
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