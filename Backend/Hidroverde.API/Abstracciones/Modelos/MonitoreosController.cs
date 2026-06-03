using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace API.Controllers
{
    [ApiController]
    [Route("api/monitoreos")]
    [Produces("application/json")]
    public class MonitoreosController : ControllerBase
    {
        private readonly IMonitoreosFlujo _monitoreosFlujo;

        public MonitoreosController(IMonitoreosFlujo monitoreosFlujo)
        {
            _monitoreosFlujo = monitoreosFlujo;
        }

        // Registra una lectura de monitoreo ambiental para un ciclo.
        [HttpPost]
        public async Task<IActionResult> Registrar(
            [FromHeader(Name = "X-Empleado-Id")] int empleadoId,
            [FromBody] MonitoreoRegistrarRequest request)
        {
            try
            {
                var id = await _monitoreosFlujo.Registrar(empleadoId, request);
                return Ok(new { monitoreoId = id });
            }
            catch (SqlException ex) when (ex.Number == 51050 || ex.Number == 51051)
            {
                return NotFound(ex.Message); // Ciclo o responsable inválido
            }
            catch (SqlException ex) when (ex.Number == 51052 || ex.Number == 51053)
            {
                return BadRequest(ex.Message); // Rango de pH / humedad inválido
            }
            catch (SqlException ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // Lista monitoreos, opcionalmente filtrados por ciclo y rango de fechas.
        [HttpGet]
        public async Task<IActionResult> Listar(
            [FromQuery] int? cicloId,
            [FromQuery] DateTime? fechaDesde,
            [FromQuery] DateTime? fechaHasta)
        {
            var data = await _monitoreosFlujo.Listar(cicloId, fechaDesde, fechaHasta);
            return Ok(data);
        }
    }
}
