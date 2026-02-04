using Abstracciones.Interfaces.Flujo;
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
    }
}
