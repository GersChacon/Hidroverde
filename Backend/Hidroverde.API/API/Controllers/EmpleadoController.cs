using Abstracciones.Interfaces.API;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmpleadoController : ControllerBase, IEmpleadoController
    {
        private readonly IEmpleadoFlujo _empleadoFlujo;
        private readonly ILogger<EmpleadoController> _logger;

        private static readonly string[] EstadosValidos = { "ACTIVO", "INACTIVO", "VACACIONES", "LICENCIA" };

        public EmpleadoController(IEmpleadoFlujo empleadoFlujo, ILogger<EmpleadoController> logger)
        {
            _empleadoFlujo = empleadoFlujo;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> Obtener()
        {
            var result = await _empleadoFlujo.Obtener();
            return Ok(result);
        }

        [HttpGet("{empleadoId:int}")]
        public async Task<IActionResult> Obtener(int empleadoId)
        {
            var result = await _empleadoFlujo.Obtener(empleadoId);
            return result == null ? NotFound() : Ok(result);
        }

        // Equivalente a ObtenerPerfilesxUsuario de la referencia
        // GET api/empleado/5/roles
        [HttpGet("{empleadoId:int}/roles")]
        public async Task<IActionResult> ObtenerRolesxEmpleado(int empleadoId)
        {
            var result = await _empleadoFlujo.ObtenerRolesxEmpleado(empleadoId);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Agregar(EmpleadoRequest empleado)
        {
            if (string.IsNullOrWhiteSpace(empleado.Cedula))
                return BadRequest("Cédula es requerida.");
            if (string.IsNullOrWhiteSpace(empleado.Email))
                return BadRequest("Email es requerido.");
            if (!EstadosValidos.Contains(empleado.Estado))
                return BadRequest($"Estado inválido. Valores permitidos: {string.Join(", ", EstadosValidos)}");

            var result = await _empleadoFlujo.Agregar(empleado);
            return CreatedAtAction(nameof(Obtener), new { empleadoId = result }, result);
        }

        [HttpPut("{empleadoId:int}")]
        public async Task<IActionResult> Editar(int empleadoId, EmpleadoRequest empleado)
        {
            if (!EstadosValidos.Contains(empleado.Estado))
                return BadRequest($"Estado inválido. Valores permitidos: {string.Join(", ", EstadosValidos)}");

            var result = await _empleadoFlujo.Editar(empleadoId, empleado);
            return Ok(result);
        }

        [HttpPatch("{empleadoId:int}/estado")]
        public async Task<IActionResult> CambiarEstado(int empleadoId, EmpleadoEstadoRequest request)
        {
            if (!EstadosValidos.Contains(request.Estado))
                return BadRequest($"Estado inválido. Valores permitidos: {string.Join(", ", EstadosValidos)}");

            var result = await _empleadoFlujo.CambiarEstado(empleadoId, request.Estado);
            return Ok(result);
        }
    }
}
