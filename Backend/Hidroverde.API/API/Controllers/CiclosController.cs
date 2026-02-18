using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Hidroverde.Abstracciones.Modelos.Ciclos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

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
            var data = (await _ciclosFlujo.ObtenerActivos())?.ToList() ?? new List<CicloActivoResponse>();

            if (data.Count == 0)
                return NoContent();

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

            try
            {
                var resp = await _ciclosFlujo.RegistrarSiembraAsync(request, responsableId);
                return Ok(resp);
            }
            catch (SqlException ex)
            {
                // Siembra: depende de tus THROW; por ahora 400 para reglas de negocio
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{cicloId:int}/cosecha")]
        public async Task<IActionResult> Cosechar(
            [FromRoute] int cicloId,
            [FromBody] CosecharCicloRequest request,
            [FromHeader(Name = "X-Empleado-Id")] int usuarioId
        )
        {
            if (usuarioId <= 0) return BadRequest("Header X-Empleado-Id inválido.");
            if (request == null) return BadRequest("Body requerido.");
            if (cicloId <= 0) return BadRequest("cicloId inválido.");

            try
            {
                var resp = await _ciclosFlujo.CosecharAsync(cicloId, request, usuarioId);
                return Ok(resp);
            }
            catch (SqlException ex) when (ex.Number == 51002)
            {
                // "Este ciclo ya fue cosechado y ya generó inventario."
                return Conflict(ex.Message); // 409
            }
            catch (SqlException ex) when (ex.Number == 51001 || ex.Number == 51005 || ex.Number == 51006)
            {
                // 51001: ciclo no existe
                // 51005: calidad inválida
                // 51006: producto inválido/inactivo
                return BadRequest(ex.Message); // 400
            }
            catch (SqlException ex)
            {
                // Configuración/infra: estados/tipos inexistentes, constraints, etc.
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("{cicloId:int}/cancelar")]
        public async Task<IActionResult> Cancelar(
            [FromRoute] int cicloId,
            [FromBody] CancelarCicloRequest request,
            [FromHeader(Name = "X-Empleado-Id")] int usuarioId
        )
        {
            if (usuarioId <= 0) return BadRequest("Header X-Empleado-Id inválido.");
            if (cicloId <= 0) return BadRequest("cicloId inválido.");

            try
            {
                var id = await _ciclosFlujo.CancelarAsync(cicloId, usuarioId, request?.Motivo);
                return Ok(new { cicloIdCancelado = id });
            }
            catch (SqlException ex)
            {
                // Si quieres, acá también podemos mapear por Number si tu SP usa THROW
                return BadRequest(ex.Message);
            }
        }
    }
}
