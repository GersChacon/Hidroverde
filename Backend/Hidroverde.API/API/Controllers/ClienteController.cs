using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos.Cliente;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClienteController : ControllerBase
    {
        private readonly IClienteFlujo _clienteFlujo;
        private readonly ILogger<ClienteController> _logger;

        public ClienteController(IClienteFlujo clienteFlujo, ILogger<ClienteController> logger)
        {
            _clienteFlujo = clienteFlujo;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Agregar([FromBody] ClienteRequest request)
        {
            try
            {
                var id = await _clienteFlujo.Agregar(request);
                return CreatedAtAction(nameof(ObtenerPorId), new { clienteId = id }, new { clienteId = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating cliente");
                return BadRequest(ex.Message); // In production, return a generic message
            }
        }

        [HttpPut("{clienteId}")]
        public async Task<IActionResult> Editar(int clienteId, [FromBody] ClienteRequest request)
        {
            try
            {
                await _clienteFlujo.Editar(clienteId, request);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error editing cliente");
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{clienteId}")]
        public async Task<IActionResult> Eliminar(int clienteId)
        {
            await _clienteFlujo.Eliminar(clienteId);
            return NoContent();
        }

        [HttpGet("{clienteId}")]
        public async Task<ActionResult<ClienteResponse>> ObtenerPorId(int clienteId)
        {
            var cliente = await _clienteFlujo.ObtenerPorId(clienteId);
            if (cliente == null) return NotFound();
            return Ok(cliente);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClienteResponse>>> ObtenerTodos([FromQuery] ClienteFilter? filtro)
        {
            var clientes = await _clienteFlujo.ObtenerTodos(filtro);
            return Ok(clientes);
        }
    }
}