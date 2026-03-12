using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos.Reportes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/reportes")]
    [Authorize] // Requiere autenticación (asumiendo que usas JWT o similar)
    public class ReportesController : ControllerBase
    {
        private readonly IReportesFlujo _reportesFlujo;
        private readonly ILogger<ReportesController> _logger;

        public ReportesController(IReportesFlujo reportesFlujo, ILogger<ReportesController> logger)
        {
            _reportesFlujo = reportesFlujo;
            _logger = logger;
        }

        private int ObtenerUsuarioId()
        {
            // Extraer empleadoId del header o claims
            if (Request.Headers.TryGetValue("X-Empleado-Id", out var headerValue))
            {
                if (int.TryParse(headerValue.ToString(), out int id) && id > 0)
                    return id;
            }

            // Fallback a claims (si usas autenticación)
            var claim = User.FindFirst("empleadoId")?.Value;
            if (!string.IsNullOrEmpty(claim) && int.TryParse(claim, out int claimId))
                return claimId;

            throw new UnauthorizedAccessException("No se pudo identificar el empleado.");
        }

        [HttpGet("definiciones")]
        [ProducesResponseType(typeof(IEnumerable<ReporteDefinicionDto>), 200)]
        public async Task<IActionResult> GetDefiniciones()
        {
            try
            {
                var userId = ObtenerUsuarioId();
                var result = await _reportesFlujo.ObtenerDefiniciones(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo definiciones");
                return StatusCode(500, "Error interno del servidor.");
            }
        }

        [HttpGet("definiciones/{id}")]
        [ProducesResponseType(typeof(ReporteDefinicionDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetDefinicion(int id)
        {
            try
            {
                var userId = ObtenerUsuarioId();
                var def = await _reportesFlujo.ObtenerDefinicion(id, userId);
                if (def == null)
                    return NotFound();
                return Ok(def);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo definición");
                return StatusCode(500, "Error interno del servidor.");
            }
        }

        [HttpPost("programaciones")]
        [ProducesResponseType(typeof(int), 201)]
        public async Task<IActionResult> CrearProgramacion([FromBody] ReporteProgramacionDto programacion)
        {
            try
            {
                var userId = ObtenerUsuarioId();
                var id = await _reportesFlujo.CrearProgramacion(programacion, userId);
                return CreatedAtAction(nameof(GetProgramacion), new { id }, id);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creando programación");
                return StatusCode(500, "Error interno del servidor.");
            }
        }

        [HttpGet("programaciones/{id}")]
        [ProducesResponseType(typeof(ReporteProgramacionDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetProgramacion(int id)
        {
            // Para simplificar, listamos todas y filtramos
            try
            {
                var userId = ObtenerUsuarioId();
                var list = await _reportesFlujo.ListarProgramaciones(userId);
                var prog = list.FirstOrDefault(p => p.ProgramacionId == id);
                if (prog == null)
                    return NotFound();
                return Ok(prog);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo programación");
                return StatusCode(500);
            }
        }

        [HttpGet("programaciones")]
        [ProducesResponseType(typeof(IEnumerable<ReporteProgramacionDto>), 200)]
        public async Task<IActionResult> GetProgramaciones()
        {
            try
            {
                var userId = ObtenerUsuarioId();
                var result = await _reportesFlujo.ListarProgramaciones(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error listando programaciones");
                return StatusCode(500);
            }
        }

        [HttpPut("programaciones/{id}")]
        public async Task<IActionResult> EditarProgramacion(int id, [FromBody] ReporteProgramacionDto programacion)
        {
            try
            {
                programacion.ProgramacionId = id;
                await _reportesFlujo.EditarProgramacion(id, programacion);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error editando programación");
                return StatusCode(500);
            }
        }

        [HttpDelete("programaciones/{id}")]
        public async Task<IActionResult> EliminarProgramacion(int id)
        {
            try
            {
                await _reportesFlujo.EliminarProgramacion(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error eliminando programación");
                return StatusCode(500);
            }
        }

        [HttpPost("generar")]
        [ProducesResponseType(typeof(int), 200)]
        public async Task<IActionResult> GenerarAhora([FromBody] GenerarReporteRequest request)
        {
            try
            {
                var userId = ObtenerUsuarioId();
                var generadoId = await _reportesFlujo.GenerarReporteAhora(request.ReporteId, request.Parametros, userId);
                return Ok(new { generadoId });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generando reporte");
                return StatusCode(500);
            }
        }

        [HttpGet("generados")]
        [ProducesResponseType(typeof(IEnumerable<ReporteGeneradoDto>), 200)]
        public async Task<IActionResult> GetGenerados([FromQuery] int? reporteId)
        {
            try
            {
                var userId = ObtenerUsuarioId();
                var result = await _reportesFlujo.ListarGenerados(userId, reporteId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error listando generados");
                return StatusCode(500);
            }
        }

        [HttpGet("generados/{id}")]
        [ProducesResponseType(typeof(ReporteGeneradoDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetGenerado(int id)
        {
            try
            {
                var userId = ObtenerUsuarioId();
                var generado = await _reportesFlujo.ObtenerGenerado(id, userId);
                if (generado == null)
                    return NotFound();
                return Ok(generado);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo generado");
                return StatusCode(500);
            }
        }

        [HttpGet("generados/{id}/export")]
        public async Task<IActionResult> Exportar(int id, [FromQuery] string formato = "pdf")
        {
            try
            {
                var userId = ObtenerUsuarioId();
                var bytes = await _reportesFlujo.ExportarReporte(id, formato, userId);
                var contentType = formato.ToLower() == "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                var fileName = $"reporte_{DateTime.Now:yyyyMMdd_HHmmss}.{(formato.ToLower() == "pdf" ? "pdf" : "xlsx")}";
                return File(bytes, contentType, fileName);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exportando reporte");
                return StatusCode(500);
            }
        }
    }
}