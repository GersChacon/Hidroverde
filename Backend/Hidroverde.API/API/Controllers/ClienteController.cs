using Abstracciones.Interfaces.API;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClienteController : ControllerBase, IClienteController
    {
        private readonly IClienteFlujo _clienteFlujo;
        private readonly ILogger<ClienteController> _logger;

        public ClienteController(IClienteFlujo clienteFlujo, ILogger<ClienteController> logger)
        {
            _clienteFlujo = clienteFlujo;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Agregar(ClienteRequest cliente)
        {
            if (string.IsNullOrWhiteSpace(cliente.Nombre))
                return BadRequest("Nombre es requerido.");
            if (string.IsNullOrWhiteSpace(cliente.Email))
                return BadRequest("Email es requerido.");
            if (string.IsNullOrWhiteSpace(cliente.Telefono))
                return BadRequest("Teléfono es requerido.");

            var result = await _clienteFlujo.Agregar(cliente);
            return CreatedAtAction(nameof(Obtener), new { clienteId = result }, result);
        }

        [HttpPut("{clienteId:int}")]
        public async Task<IActionResult> Editar(int clienteId, ClienteRequest cliente)
        {
            var result = await _clienteFlujo.Editar(clienteId, cliente);
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> Obtener()
        {
            var result = await _clienteFlujo.Obtener();
            return Ok(result);
        }

        [HttpGet("{clienteId:int}")]
        public async Task<IActionResult> Obtener(int clienteId)
        {
            var result = await _clienteFlujo.Obtener(clienteId);
            return result == null ? NotFound() : Ok(result);
        }

        // --- Direcciones como subrecurso ---

        [HttpGet("{clienteId:int}/direcciones")]
        public async Task<IActionResult> ObtenerDirecciones(int clienteId)
        {
            var result = await _clienteFlujo.ObtenerDirecciones(clienteId);
            return Ok(result);
        }

        [HttpPost("{clienteId:int}/direcciones")]
        public async Task<IActionResult> AgregarDireccion(int clienteId, DireccionClienteRequest direccion)
        {
            if (string.IsNullOrWhiteSpace(direccion.DireccionExacta))
                return BadRequest("DireccionExacta es requerida.");

            direccion.ClienteId = clienteId;
            var result = await _clienteFlujo.AgregarDireccion(direccion);
            return CreatedAtAction(nameof(ObtenerDirecciones), new { clienteId }, result);
        }

        [HttpPut("{clienteId:int}/direcciones/{direccionId:int}")]
        public async Task<IActionResult> EditarDireccion(int clienteId, int direccionId, DireccionClienteRequest direccion)
        {
            direccion.ClienteId = clienteId;
            var result = await _clienteFlujo.EditarDireccion(direccionId, direccion);
            return Ok(result);
        }

        [HttpDelete("{clienteId:int}/direcciones/{direccionId:int}")]
        public async Task<IActionResult> EliminarDireccion(int clienteId, int direccionId)
        {
            await _clienteFlujo.EliminarDireccion(direccionId);
            return NoContent();
        }
    }
}