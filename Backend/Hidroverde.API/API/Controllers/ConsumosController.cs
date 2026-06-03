using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Text;

namespace Hidroverde.API.Controllers
{
    [ApiController]
    [Route("api/consumos")]
    public class ConsumosController : ControllerBase
    {
        private readonly IConsumosFlujo _consumosFlujo;

        public ConsumosController(IConsumosFlujo consumosFlujo)
        {
            _consumosFlujo = consumosFlujo;
        }

        [HttpGet("tipos-recurso")]
        public async Task<IActionResult> ObtenerTiposRecurso()
        {
            var data = await _consumosFlujo.ObtenerTiposRecurso();
            return Ok(data);
        }

        // Puente de costos: costo de producción de un ciclo a partir de los consumos vigentes.
        [HttpGet("costo-ciclo/{cicloId:int}")]
        public async Task<IActionResult> CostoPorCiclo(
            int cicloId,
            [FromQuery] DateTime? fechaDesde,
            [FromQuery] DateTime? fechaHasta)
        {
            var data = await _consumosFlujo.ObtenerCostoPorCiclo(cicloId, fechaDesde, fechaHasta);
            return Ok(data);
        }

        // Fija el costo unitario de un tipo de recurso (insumo de costos del puente).
        [HttpPut("tipos-recurso/{tipoRecursoId:int}/costo")]
        public async Task<IActionResult> ActualizarCosto(int tipoRecursoId, [FromBody] ActualizarCostoRequest request)
        {
            try
            {
                var r = await _consumosFlujo.ActualizarCostoRecurso(tipoRecursoId, request.CostoUnitario);
                return Ok(new { tipoRecursoId = r });
            }
            catch (SqlException ex) when (ex.Number == 51030)
            {
                return BadRequest(ex.Message); // Costo negativo
            }
            catch (SqlException ex) when (ex.Number == 51031)
            {
                return NotFound(ex.Message); // Tipo de recurso inválido o inactivo
            }
            catch (SqlException ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // Borrado lógico de un consumo (conserva versiones para auditoría).
        [HttpDelete("{consumoId:long}")]
        public async Task<IActionResult> Eliminar(long consumoId)
        {
            try
            {
                await _consumosFlujo.Eliminar(consumoId);
                return NoContent();
            }
            catch (SqlException ex) when (ex.Number == 51040)
            {
                return NotFound(ex.Message); // No existe o ya inactivo
            }
            catch (SqlException ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Registrar(
            [FromHeader(Name = "X-Empleado-Id")] int empleadoId,
            [FromBody] ConsumoRequest request)
        {
            var consumoId = await _consumosFlujo.Registrar(empleadoId, request);
            return Ok(new { consumoId });
        }

        [HttpPut("{consumoId:long}")]
        public async Task<IActionResult> Editar(
            long consumoId,
            [FromHeader(Name = "X-Empleado-Id")] int empleadoId,
            [FromBody] ConsumoEditRequest request)
        {
            var r = await _consumosFlujo.Editar(consumoId, empleadoId, request);
            return Ok(r);
        }

        [HttpGet]
        public async Task<IActionResult> Obtener(
            [FromQuery] int? cicloId,
            [FromQuery] DateTime? fechaDesde,
            [FromQuery] DateTime? fechaHasta,
            [FromQuery] int? tipoRecursoId)
        {
            var data = await _consumosFlujo.Obtener(cicloId, fechaDesde, fechaHasta, tipoRecursoId);
            return Ok(data);
        }

        [HttpGet("{consumoId:long}/historial")]
        public async Task<IActionResult> Historial(long consumoId)
        {
            var data = await _consumosFlujo.ObtenerHistorial(consumoId);
            return Ok(data);
        }

        [HttpGet("reporte")]
        public async Task<IActionResult> Reporte(
            [FromQuery] int? cicloId,
            [FromQuery] DateTime? fechaDesde,
            [FromQuery] DateTime? fechaHasta,
            [FromQuery] string granularidad = "DIA")
        {
            var data = await _consumosFlujo.ObtenerReporte(cicloId, fechaDesde, fechaHasta, granularidad);
            return Ok(data);
        }

        [HttpGet("reporte-diario")]
        public async Task<IActionResult> ReporteDiario(
            [FromQuery] int? cicloId,
            [FromQuery] DateTime? fechaDesde,
            [FromQuery] DateTime? fechaHasta,
            [FromQuery] int? tipoRecursoId)
        {
            var r = await _consumosFlujo.ObtenerReporteDiario(cicloId, fechaDesde, fechaHasta, tipoRecursoId);
            return Ok(r);
        }

        [HttpGet("reporte-diario/export/csv")]
        public async Task<IActionResult> ExportReporteDiarioCsv(
            [FromQuery] int? cicloId,
            [FromQuery] DateTime? fechaDesde,
            [FromQuery] DateTime? fechaHasta,
            [FromQuery] int? tipoRecursoId)
        {
            var data = await _consumosFlujo.ObtenerReporteDiario(cicloId, fechaDesde, fechaHasta, tipoRecursoId);

            var sb = new StringBuilder();
            sb.AppendLine("Fecha,CicloId,TipoRecursoId,Codigo,RecursoNombre,Unidad,Periodicidad,TotalCantidad");

            string CsvSafe(string? s) => "\"" + (s ?? "").Replace("\"", "\"\"") + "\"";

            foreach (var r in data)
            {
                sb.AppendLine(
                    $"{r.Fecha:yyyy-MM-dd}," +
                    $"{r.CicloId}," +
                    $"{r.TipoRecursoId}," +
                    $"{CsvSafe(r.Codigo)}," +
                    $"{CsvSafe(r.RecursoNombre)}," +
                    $"{CsvSafe(r.Unidad)}," +
                    $"{CsvSafe(r.PeriodicidadCodigo)}," +
                    $"{r.TotalCantidad}"
                );
            }

            var bytes = Encoding.UTF8.GetBytes(sb.ToString());
            var fileName = $"reporte_consumos_diario_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
            return File(bytes, "text/csv; charset=utf-8", fileName);
        }

        [HttpGet("reporte-diario/export/excel")]
        public async Task<IActionResult> ExportReporteDiarioExcel(
            [FromQuery] int? cicloId,
            [FromQuery] DateTime? fechaDesde,
            [FromQuery] DateTime? fechaHasta,
            [FromQuery] int? tipoRecursoId)
        {
            var data = await _consumosFlujo.ObtenerReporteDiario(cicloId, fechaDesde, fechaHasta, tipoRecursoId);

            static string HtmlEncode(string? s) =>
                (s ?? "")
                .Replace("&", "&amp;")
                .Replace("<", "&lt;")
                .Replace(">", "&gt;")
                .Replace("\"", "&quot;");

            var sb = new StringBuilder();
            sb.AppendLine("<html><head><meta charset='UTF-8'></head><body>");
            sb.AppendLine("<table border='1'>");
            sb.AppendLine("<tr><th>Fecha</th><th>CicloId</th><th>TipoRecursoId</th><th>Codigo</th><th>Recurso</th><th>Unidad</th><th>Periodicidad</th><th>Total</th></tr>");

            foreach (var r in data)
            {
                sb.AppendLine("<tr>");
                sb.AppendLine($"<td>{r.Fecha:yyyy-MM-dd}</td>");
                sb.AppendLine($"<td>{r.CicloId}</td>");
                sb.AppendLine($"<td>{r.TipoRecursoId}</td>");
                sb.AppendLine($"<td>{HtmlEncode(r.Codigo)}</td>");
                sb.AppendLine($"<td>{HtmlEncode(r.RecursoNombre)}</td>");
                sb.AppendLine($"<td>{HtmlEncode(r.Unidad)}</td>");
                sb.AppendLine($"<td>{HtmlEncode(r.PeriodicidadCodigo)}</td>");
                sb.AppendLine($"<td>{r.TotalCantidad}</td>");
                sb.AppendLine("</tr>");
            }

            sb.AppendLine("</table></body></html>");

            var bytes = Encoding.UTF8.GetBytes(sb.ToString());
            var fileName = $"reporte_consumos_diario_{DateTime.Now:yyyyMMdd_HHmmss}.xls";
            return File(bytes, "application/vnd.ms-excel", fileName);
        }
    }
}