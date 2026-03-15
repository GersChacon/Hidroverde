using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos.Checklist;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChecklistController : ControllerBase
    {
        private readonly IChecklistFlujo _checklistFlujo;

        public ChecklistController(IChecklistFlujo checklistFlujo)
        {
            _checklistFlujo = checklistFlujo;
        }

        [HttpGet("kpi/summary")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetKpiSummary([FromQuery] DateTime? fecha = null)
        {
            try
            {
                var fechaConsulta = fecha ?? DateTime.Today;
                var tareas = await _checklistFlujo.ObtenerChecklistHoy(null);

                if (tareas != null && tareas.Any())
                {
                    var total = tareas.Count();
                    var completadas = tareas.Count(t => t.IsCompleted);
                    var porcentaje = total > 0 ? (completadas * 100 / total) : 0;

                    string estado = porcentaje >= 80 ? "BUENO" : porcentaje >= 50 ? "REGULAR" : "CRÍTICO";

                    return Ok(new
                    {
                        fecha = fechaConsulta.ToString("yyyy-MM-dd"),
                        totalTareas = total,
                        tareasCompletadas = completadas,
                        tareasPendientes = total - completadas,
                        porcentajeCumplimiento = porcentaje,
                        estado = estado
                    });
                }

                return Ok(new
                {
                    fecha = fechaConsulta.ToString("yyyy-MM-dd"),
                    totalTareas = 0,
                    tareasCompletadas = 0,
                    tareasPendientes = 0,
                    porcentajeCumplimiento = 0,
                    estado = "SIN_DATOS"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("today")]
        [ProducesResponseType(typeof(IEnumerable<ChecklistTaskDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> ObtenerChecklistHoy(
            [FromHeader(Name = "X-Empleado-Id")] int? empleadoId)
        {
            try
            {
                var tasks = await _checklistFlujo.ObtenerChecklistHoy(empleadoId);

                if (tasks == null || !tasks.Any())
                    return NoContent();

                return Ok(tasks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al cargar checklist: {ex.Message}");
            }
        }

        [HttpPatch("task/{id}/complete")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> MarcarCompletada(
            int id,
            [FromHeader(Name = "X-Empleado-Id")] int empleadoId)
        {
            if (empleadoId <= 0)
                return BadRequest("Header X-Empleado-Id inválido.");

            try
            {
                await _checklistFlujo.MarcarTareaCompletada(id, empleadoId, DateTime.Now);
                return Ok(new { mensaje = "Tarea marcada como completada.", success = true });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("tasks")]
        [ProducesResponseType(typeof(int), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CrearTarea([FromBody] ChecklistTaskDto tarea)
        {
            try
            {
                var tareaId = await _checklistFlujo.CrearTarea(tarea);
                return CreatedAtAction(nameof(ObtenerChecklistHoy), new { id = tareaId }, new { tareaId, mensaje = "Tarea creada exitosamente." });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpDelete("tasks/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> EliminarTarea(int id)
        {
            try
            {
                await _checklistFlujo.EliminarTarea(id);
                return Ok(new { mensaje = "Tarea eliminada correctamente.", success = true });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}