using Abstracciones.Interfaces.Flujo;
using Microsoft.AspNetCore.Mvc;

namespace Hidroverde.API.Controllers
{
    [ApiController]
    [Route("api/recursos-tipo")]
    public class RecursosTipoController : ControllerBase
    {
        private readonly ITiposRecursoFlujo _tiposRecursoFlujo;

        public RecursosTipoController(ITiposRecursoFlujo tiposRecursoFlujo)
        {
            _tiposRecursoFlujo = tiposRecursoFlujo;
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerActivos()
        {
            var data = await _tiposRecursoFlujo.ObtenerActivos();
            return Ok(data);
        }
    }
}
