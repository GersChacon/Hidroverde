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

<<<<<<< HEAD
        public ChecklistController(IChecklistFlujo checklistFlujo)
        {
            _checklistFlujo = checklistFlujo;
        }

=======
>>>>>>> c258a47c036e1f2f3bda8cbc9ae982b2e22d35a1
        [HttpGet("kpi/summary")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetKpiSummary([FromQuery] DateTime? fecha = null)
        {
            try
            {
                var fechaConsulta = fecha ?? DateTime.Today;
<<<<<<< HEAD

                // Try to get real data first
                var tareas = await _checklistFlujo.ObtenerChecklistHoy(null);

                // If we got real data (not the mock fallback from Flujo/DA)
                if (tareas != null && tareas.Any())
                {
                    return Ok(CalculateKpiSummary(tareas, fechaConsulta));
                }

                // If Flujo returned null/empty, use mock
                return Ok(GetMockKpiSummary(fechaConsulta));
=======
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
>>>>>>> c258a47c036e1f2f3bda8cbc9ae982b2e22d35a1
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading checklist KPI: {ex.Message}");
<<<<<<< HEAD
                // Mock data fallback
                return Ok(GetMockKpiSummary(fecha ?? DateTime.Today));
            }
        }
=======

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
>>>>>>> c258a47c036e1f2f3bda8cbc9ae982b2e22d35a1

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
<<<<<<< HEAD
            try
            {
                // Try to get real data
                var tasks = await _checklistFlujo.ObtenerChecklistHoy(empleadoId);

                // If we got real data and it has items
                if (tasks != null && tasks.Any())
                {
                    return Ok(tasks);
                }

                // If Flujo returned null/empty, use mock
                var mockTasks = GetMockChecklistTasks(empleadoId);
                if (mockTasks.Any())
                {
                    return Ok(mockTasks);
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading checklist: {ex.Message}");

                // Mock data fallback on error
                var mockTasks = GetMockChecklistTasks(empleadoId);
                if (mockTasks.Any())
                {
                    return Ok(mockTasks);
                }

                return NoContent();
            }
=======
            var tasks = await _checklistFlujo.ObtenerChecklistHoy(empleadoId);
            if (tasks == null || !tasks.Any())
                return NoContent();
            return Ok(tasks);
>>>>>>> c258a47c036e1f2f3bda8cbc9ae982b2e22d35a1
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
<<<<<<< HEAD
                // Try to mark as complete in database
                await _checklistFlujo.MarcarTareaCompletada(id, empleadoId, DateTime.Now);
                return Ok(new { mensaje = "Tarea marcada como completada.", success = true });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error marking task {id} as complete: {ex.Message}");

                // For mock mode, just return success
                // This allows the frontend to work even without database
                return Ok(new
                {
                    mensaje = "Tarea marcada como completada (modo simulación).",
                    success = true,
                    mock = true
                });
            }
        }

        #region Mock Data Methods

        private object CalculateKpiSummary(IEnumerable<ChecklistTaskDto> tareas, DateTime fecha)
        {
            var total = tareas.Count();
            var completadas = tareas.Count(t => t.IsCompleted);
            var pendientes = total - completadas;
            var porcentaje = total > 0 ? (completadas * 100 / total) : 0;

            string estado;
            if (porcentaje >= 80) estado = "BUENO";
            else if (porcentaje >= 50) estado = "REGULAR";
            else estado = "CRÍTICO";

            return new
            {
                fecha = fecha.ToString("yyyy-MM-dd"),
                totalTareas = total,
                tareasCompletadas = completadas,
                tareasPendientes = pendientes,
                porcentajeCumplimiento = porcentaje,
                estado = estado
            };
        }

        private object GetMockKpiSummary(DateTime fecha)
        {
            return new
            {
                fecha = fecha.ToString("yyyy-MM-dd"),
                totalTareas = 12,
                tareasCompletadas = 8,
                tareasPendientes = 4,
                porcentajeCumplimiento = 67,
                estado = "REGULAR"
            };
        }

        private IEnumerable<ChecklistTaskDto> GetMockChecklistTasks(int? empleadoId)
        {
            var mockTasks = new List<ChecklistTaskDto>
            {
                new ChecklistTaskDto
                {
                    TaskId = 1,
                    Description = "Preparación de insumos (semillas, sustrato, nutrientes)",
                    Responsible = "Fiorella",
                    IsCompleted = false,
                    DueDate = DateTime.Today,
                    AssignedUserId = 1
                },
                new ChecklistTaskDto
                {
                    TaskId = 2,
                    Description = "Plantación / trasplante en torres",
                    Responsible = "Asistente",
                    IsCompleted = false,
                    DueDate = DateTime.Today,
                    AssignedUserId = 2
                },
                new ChecklistTaskDto
                {
                    TaskId = 3,
                    Description = "Revisión y programación del riego",
                    Responsible = "Diego",
                    IsCompleted = DateTime.Today.DayOfWeek == DayOfWeek.Monday ? false : true,
                    DueDate = DateTime.Today,
                    AssignedUserId = 3
                },
                new ChecklistTaskDto
                {
                    TaskId = 4,
                    Description = "Monitoreo de pH y EC",
                    Responsible = "Técnico",
                    IsCompleted = false,
                    DueDate = DateTime.Today,
                    AssignedUserId = 4
                },
                new ChecklistTaskDto
                {
                    TaskId = 5,
                    Description = "Limpieza de filtros",
                    Responsible = "Operario",
                    IsCompleted = false,
                    DueDate = DateTime.Today,
                    AssignedUserId = 5
                },
                new ChecklistTaskDto
                {
                    TaskId = 6,
                    Description = "Registro de temperatura y humedad",
                    Responsible = "Técnico",
                    IsCompleted = false,
                    DueDate = DateTime.Today,
                    AssignedUserId = 4
                }
            };

            if (empleadoId.HasValue)
            {
                // Return tasks for specific employee, or empty list if none assigned
                return mockTasks.Where(t => t.AssignedUserId == empleadoId.Value).ToList();
            }

            return mockTasks;
        }

        #endregion
    }
}
=======
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
>>>>>>> c258a47c036e1f2f3bda8cbc9ae982b2e22d35a1
