using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace Hidroverde.API.Controllers
{
    [ApiController]
    [Route("api/compras-plantas")]
    public class ComprasPlantasController : ControllerBase
    {
        private readonly IComprasPlantasFlujo _flujo;

        public ComprasPlantasController(IComprasPlantasFlujo flujo)
        {
            _flujo = flujo;
        }

        [HttpPost]
        public async Task<IActionResult> RegistrarCompra([FromBody] CompraPlantaRequest request)
        {
            var id = await _flujo.RegistrarCompra(request);
            return Ok(id);
        }

        [HttpPost("detalle")]
        public async Task<IActionResult> RegistrarDetalle([FromBody] CompraPlantaDetalleRequest request)
        {
            var id = await _flujo.RegistrarDetalle(request);
            return Ok(id);
        }

        [HttpPost("merma")]
        public async Task<IActionResult> RegistrarMerma([FromBody] CompraPlantaMermaRequest request)
        {
            var id = await _flujo.RegistrarMerma(request);
            return Ok(id);
        }

        [HttpGet("margenes")]
        public async Task<IActionResult> ObtenerMargenes()
        {
            var data = await _flujo.ObtenerMargenes();
            return Ok(data);
        }

        [HttpGet("detalle-por-producto-proveedor")]
        public async Task<IActionResult> ObtenerDetalleParaMerma([FromQuery] int productoId, [FromQuery] int proveedorId)
        {
            var data = await _flujo.ObtenerDetalleParaMerma(productoId, proveedorId);
            return data == null ? NotFound() : Ok(data);
        }
    }
}