using Abstracciones.Interfaces.API;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
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

        [Authorize(Roles = "1")]
        [HttpPost("ObtenerInformacionEmpleado")]
        public async Task<IActionResult> ObtenerEmpleadoAuth([FromBody] EmpleadoAuthBase empleado)
        {
            return Ok(await _empleadoAuthFlujo.ObtenerEmpleadoAuth(empleado));
        }

        [AllowAnonymous]
        [HttpPost("RegistrarEmpleado")]
        public async Task<IActionResult> PostAsync([FromBody] EmpleadoAuthBase empleado)
        {
            var resultado = await _empleadoAuthFlujo.RegistrarEmpleadoAuth(empleado);
            return CreatedAtAction(nameof(ObtenerEmpleadoAuth), null, resultado);
        }
    }
}
