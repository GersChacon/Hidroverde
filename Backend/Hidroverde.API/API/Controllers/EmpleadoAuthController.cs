using Abstracciones.Interfaces.API;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    // Equivalente a UsuarioController de la referencia
    // Registro y consulta de credenciales de empleado
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class EmpleadoAuthController : ControllerBase, IEmpleadoAuthController
    {
        private readonly IEmpleadoAuthFlujo _empleadoAuthFlujo;

        public EmpleadoAuthController(IEmpleadoAuthFlujo empleadoAuthFlujo)
        {
            _empleadoAuthFlujo = empleadoAuthFlujo;
        }

        // Solo el rol ADMIN (rol_id = 1) puede consultar info de un empleado
        // Equivalente a [Authorize(Roles = "1")] de la referencia
        [Authorize(Roles = "1")]
        [HttpPost("ObtenerInformacionEmpleado")]
        public async Task<IActionResult> ObtenerEmpleadoAuth([FromBody] EmpleadoAuthBase empleado)
        {
            return Ok(await _empleadoAuthFlujo.ObtenerEmpleadoAuth(empleado));
        }

        // Permite al empleado registrar/actualizar su usuario_sistema y clave
        // Equivalente a RegistrarUsuario de la referencia
        [AllowAnonymous]
        [HttpPost("RegistrarEmpleado")]
        public async Task<IActionResult> PostAsync([FromBody] EmpleadoAuthBase empleado)
        {
            var resultado = await _empleadoAuthFlujo.RegistrarEmpleadoAuth(empleado);
            return CreatedAtAction(nameof(ObtenerEmpleadoAuth), null, resultado);
        }
    }
}
