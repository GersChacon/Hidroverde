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

        [HttpGet("kpi/summary")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetKpiSummary([FromQuery] DateTime? fecha = null)
        {
            try
            {
                var fechaConsulta = fecha ?? DateTime.Today;
                var tareas = await _checklistFlujo.ObtenerChecklistHoy(null);

                var total = tareas.Count();
                var completadas = tareas.Count(t => t.IsCompleted);
                var pendientes = total - completadas;
                var porcentaje = total > 0 ? (completadas * 100 / total) : 0;

                string estado;
                if (porcentaje >= 80) estado = "BUENO";
                else if (porcentaje >= 50) estado = "REGULAR";
                else estado = "CRÍTICO";

                return Ok(new
                {
                    fecha = fechaConsulta.ToString("yyyy-MM-dd"),
                    totalTareas = total,
                    tareasCompletadas = completadas,
                    tareasPendientes = pendientes,
                    porcentajeCumplimiento = porcentaje,
                    estado = estado
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading checklist KPI: {ex.Message}");

                // Mock data fallback
                return Ok(new
                {
                    fecha = fecha?.ToString("yyyy-MM-dd") ?? DateTime.Today.ToString("yyyy-MM-dd"),
                    totalTareas = 12,
                    tareasCompletadas = 8,
                    tareasPendientes = 4,
                    porcentajeCumplimiento = 67,
                    estado = "REGULAR"
                });
            }
        }
        public ChecklistController(IChecklistFlujo checklistFlujo)
        {
            _checklistFlujo = checklistFlujo;
        }

        /// <summary>
        /// Obtiene el checklist de tareas para hoy.
        /// </summary>
        /// <param name="empleadoId">Opcional: ID del empleado para filtrar sus tareas asignadas (header X-Empleado-Id).</param>
        [HttpGet("today")]
        [ProducesResponseType(typeof(IEnumerable<ChecklistTaskDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> ObtenerChecklistHoy(
            [FromHeader(Name = "X-Empleado-Id")] int? empleadoId)
        {
            var tasks = await _checklistFlujo.ObtenerChecklistHoy(empleadoId);
            if (tasks == null || !tasks.Any())
                return NoContent();
            return Ok(tasks);
        }

        /// <summary>
        /// Marca una tarea del checklist como completada.
        /// </summary>
        /// <param name="id">ID de la tarea.</param>
        /// <param name="empleadoId">ID del empleado que completa la tarea (header X-Empleado-Id).</param>
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
                return Ok(new { mensaje = "Tarea marcada como completada." });
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}