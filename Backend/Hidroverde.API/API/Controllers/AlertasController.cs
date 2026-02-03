using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class AlertasController : ControllerBase
    {
        private readonly IAlertasFlujo _alertasFlujo;

        public AlertasController(IAlertasFlujo alertasFlujo)
        {
            _alertasFlujo = alertasFlujo;
        }

        [HttpGet("badge")]
        [ProducesResponseType(typeof(AlertaBadgeDto), StatusCodes.Status200OK)]
        public ActionResult<AlertaBadgeDto> Badge()
        {
            _alertasFlujo.GenerarAlertasStockBajo();
            return Ok(_alertasFlujo.ObtenerBadge());
        }


        [HttpGet("activas")]
        [ProducesResponseType(typeof(IEnumerable<AlertaActivaDto>), StatusCodes.Status200OK)]
        public ActionResult<IEnumerable<AlertaActivaDto>> Activas()
        {
            // 1) Genera si hace falta (sin duplicar)
            _alertasFlujo.GenerarAlertasStockBajo();

            // 2) Lista activas
            var resultado = _alertasFlujo.ListarAlertasActivas();
            return Ok(resultado);
        }


        [HttpPost("{alertaId:int}/aceptar")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult Aceptar(int alertaId, [FromQuery] int empleadoId)
        {
            if (empleadoId <= 0)
                return BadRequest("empleadoId es requerido y debe ser > 0.");

            _alertasFlujo.AceptarAlerta(alertaId, empleadoId);
            return Ok(new { mensaje = "Alerta aceptada (si estaba ACTIVA)." });
        }
    }
}
