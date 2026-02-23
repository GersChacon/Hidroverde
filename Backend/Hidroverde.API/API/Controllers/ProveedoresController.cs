using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace Hidroverde.API.Controllers
{
    [ApiController]
    [Route("api/proveedores")]
    public class ProveedoresController : ControllerBase
    {
        private readonly IProveedoresFlujo _proveedoresFlujo;

        public ProveedoresController(IProveedoresFlujo proveedoresFlujo)
        {
            _proveedoresFlujo = proveedoresFlujo;
        }

        [HttpGet("pendientes-pago")]
        public async Task<IActionResult> ListarPendientesPago()
        {
            var data = await _proveedoresFlujo.ListarPendientesPago();
            return Ok(data);
        }

        [HttpPost("compras/monto")]
        public async Task<IActionResult> RegistrarCompraMonto([FromBody] ProveedorCompraMontoRequest request)
        {
            var resp = await _proveedoresFlujo.RegistrarCompraMonto(request);
            return Ok(resp);
        }

        [HttpPost("pagos")]
        public async Task<IActionResult> RegistrarPago([FromBody] ProveedorPagoRequest request)
        {
            var resp = await _proveedoresFlujo.RegistrarPago(request);
            return Ok(resp);
        }

        // GET: api/proveedores/{proveedorId}/pagos
        [HttpGet("{proveedorId:int}/pagos")]
        public async Task<IActionResult> ListarPagosPorProveedor([FromRoute] int proveedorId)
        {
            var data = await _proveedoresFlujo.ListarPagosPorProveedor(proveedorId);
            return Ok(data);
        }

        // GET: api/proveedores/pagos
        [HttpGet("pagos")]
        public async Task<IActionResult> ListarPagos()
        {
            var data = await _proveedoresFlujo.ListarPagos();
            return Ok(data);
        }
        // POST: api/proveedores/compras/nombre
        [HttpPost("compras/nombre")]
        public async Task<IActionResult> RegistrarCompraPorNombre([FromBody] ProveedorCompraNombreRequest request)
        {
            var data = await _proveedoresFlujo.RegistrarCompraPorNombre(request);
            return Ok(data);
        }
        // GET: api/proveedores/lista
        [HttpGet("lista")]
        public async Task<IActionResult> ListarActivos()
        {
            var data = await _proveedoresFlujo.ListarActivos();
            return Ok(data);
        }
        // POST: api/proveedores
        [HttpPost]
        public async Task<IActionResult> CrearProveedor([FromBody] ProveedorCrearRequest request)
        {
            var data = await _proveedoresFlujo.CrearProveedor(request);
            return Ok(data);
        }
    }
}