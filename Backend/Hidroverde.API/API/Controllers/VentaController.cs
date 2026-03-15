using Abstracciones.Interfaces.API;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VentaController : ControllerBase, IVentaController
    {
        private readonly IVentaFlujo _ventaFlujo;
        private readonly ILogger<VentaController> _logger;

        public VentaController(IVentaFlujo ventaFlujo, ILogger<VentaController> logger)
        {
            _ventaFlujo = ventaFlujo;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> Obtener()
        {
            var result = await _ventaFlujo.Obtener();
            return Ok(result);
        }

        [HttpGet("{ventaId:int}")]
        public async Task<IActionResult> Obtener(int ventaId)
        {
            var result = await _ventaFlujo.Obtener(ventaId);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Crear(VentaRequest venta)
        {
            if (venta.ClienteId <= 0)
                return BadRequest("ClienteId es requerido.");
            if (venta.DireccionEntregaId <= 0)
                return BadRequest("DireccionEntregaId es requerido.");
            if (venta.VendedorId <= 0)
                return BadRequest("VendedorId es requerido.");
            if (venta.Detalle == null || !venta.Detalle.Any())
                return BadRequest("La venta debe tener al menos un producto en el detalle.");
            if (venta.Detalle.Any(d => d.Cantidad <= 0))
                return BadRequest("La cantidad de cada producto debe ser mayor a 0.");
            if (venta.Detalle.Any(d => d.PrecioUnitario <= 0))
                return BadRequest("El precio unitario debe ser mayor a 0.");

            try
            {
                var ventaId = await _ventaFlujo.Crear(venta);
                return CreatedAtAction(nameof(Obtener), new { ventaId }, new { ventaId });
            }
            catch (SqlException ex) when (ex.Number == 51100)
            {
                return NotFound(ex.Message); // Cliente no encontrado
            }
            catch (SqlException ex) when (ex.Number == 51101)
            {
                return BadRequest(ex.Message); // Dirección no pertenece al cliente
            }
            catch (SqlException ex) when (ex.Number == 51102)
            {
                return Conflict(ex.Message); // Stock insuficiente
            }
            catch (SqlException ex) when (ex.Number == 51103)
            {
                return BadRequest(ex.Message); // Producto inactivo o no encontrado
            }
            catch (SqlException ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPatch("{ventaId:int}/estado")]
        public async Task<IActionResult> CambiarEstado(int ventaId, VentaEstadoRequest request)
        {
            if (request.EstadoVentaId <= 0)
                return BadRequest("EstadoVentaId es requerido.");

            try
            {
                var result = await _ventaFlujo.CambiarEstado(ventaId, request);
                return Ok(result);
            }
            catch (SqlException ex) when (ex.Number == 51104)
            {
                return BadRequest(ex.Message); // Venta no permite modificación en este estado
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

        [HttpPatch("{ventaId:int}/pago")]
        public async Task<IActionResult> ConfirmarPago(int ventaId, VentaPagoRequest request)
        {
            if (request.EstadoPagoId <= 0)
                return BadRequest("EstadoPagoId es requerido.");
            if (request.MetodoPagoId <= 0)
                return BadRequest("MetodoPagoId es requerido.");

            try
            {
                var result = await _ventaFlujo.ConfirmarPago(ventaId, request);
                return Ok(result);
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

        [HttpPost("{ventaId:int}/cancelar")]
        public async Task<IActionResult> Cancelar(int ventaId, VentaCancelarRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Motivo))
                return BadRequest("El motivo de cancelación es requerido.");

            try
            {
                var result = await _ventaFlujo.Cancelar(ventaId, request);
                return Ok(result);
            }
            catch (SqlException ex) when (ex.Number == 51105)
            {
                return Conflict(ex.Message); // Venta ya cancelada o no cancelable
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

        [HttpPost("{ventaId:int}/detalle")]
        public async Task<IActionResult> AgregarDetalle(int ventaId, VentaAgregarDetalleRequest request)
        {
            if (request.Detalle == null || !request.Detalle.Any())
                return BadRequest("Debe incluir al menos un producto.");

            try
            {
                var result = await _ventaFlujo.AgregarDetalle(ventaId, request);
                return Ok(result);
            }
            catch (SqlException ex) when (ex.Number == 51104)
            {
                return BadRequest(ex.Message); // Venta no permite modificación
            }
            catch (SqlException ex) when (ex.Number == 51102)
            {
                return Conflict(ex.Message); // Stock insuficiente
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

        [HttpDelete("{ventaId:int}/detalle/{detalleId:int}")]
        public async Task<IActionResult> EliminarDetalle(int ventaId, int detalleId)
        {
            try
            {
                await _ventaFlujo.EliminarDetalle(ventaId, detalleId);
                return NoContent();
            }
            catch (SqlException ex) when (ex.Number == 51104)
            {
                return BadRequest(ex.Message); // Venta no permite modificación
            }
            catch (SqlException ex) when (ex.Number == 51106)
            {
                return BadRequest(ex.Message); // No se puede eliminar el último producto
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
    }
}