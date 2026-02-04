using Abstracciones.Interfaces.Flujo;
using Hidroverde.Abstracciones.Modelos.Ciclos;
using Microsoft.AspNetCore.Mvc;

namespace Hidroverde.API.Controllers
{
    [ApiController]
    [Route("api/ciclos")]
    public class CiclosController : ControllerBase
    {
        private readonly ICiclosFlujo _ciclosFlujo;

        public CiclosController(ICiclosFlujo ciclosFlujo)
        {
            _ciclosFlujo = ciclosFlujo;
        }

        [HttpGet("activos")]
        public async Task<IActionResult> ObtenerActivos()
        {
            var data = await _ciclosFlujo.ObtenerActivos();
            return Ok(data);
        }

        [HttpPost("siembra")]
        public async Task<IActionResult> RegistrarSiembra(
            [FromBody] RegistrarSiembraRequest request,
            [FromHeader(Name = "X-Empleado-Id")] int responsableId
        )
        {
            if (responsableId <= 0) return BadRequest("Header X-Empleado-Id inválido.");
            if (request == null) return BadRequest("Body requerido.");

            var resp = await _ciclosFlujo.RegistrarSiembraAsync(request, responsableId);
            return Ok(resp);
        }
    }
}
