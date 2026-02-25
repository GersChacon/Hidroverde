using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos.History;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HistoryController : ControllerBase
    {
        private readonly IHistoryFlujo _historyFlujo;

        public HistoryController(IHistoryFlujo historyFlujo)
        {
            _historyFlujo = historyFlujo;
        }

        /// <summary>
        /// Retrieves historical task completions with optional filters.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<CompletedTaskHistoryDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetHistory(
            [FromQuery] int? userId,
            [FromQuery] string? batchId,
            [FromQuery] DateTime? dateFrom,
            [FromQuery] DateTime? dateTo)
        {
            var filter = new HistoryFilterRequest
            {
                UserId = userId,
                BatchId = batchId,
                DateFrom = dateFrom,
                DateTo = dateTo
            };

            try
            {
                var result = await _historyFlujo.GetHistoryAsync(filter);
                if (result == null || !result.Any())
                    return NoContent();

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Exports filtered history as CSV file.
        /// </summary>
        [HttpGet("export/csv")]
        [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ExportCsv(
            [FromQuery] int? userId,
            [FromQuery] string? batchId,
            [FromQuery] DateTime? dateFrom,
            [FromQuery] DateTime? dateTo)
        {
            var filter = new HistoryFilterRequest
            {
                UserId = userId,
                BatchId = batchId,
                DateFrom = dateFrom,
                DateTo = dateTo
            };

            try
            {
                var data = await _historyFlujo.GetHistoryAsync(filter);
                if (data == null || !data.Any())
                    return NoContent();

                var csvBytes = GenerateCsv(data);
                var fileName = $"historial_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
                return File(csvBytes, "text/csv; charset=utf-8", fileName);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Exports filtered history as Excel file (XLS format, compatible with Excel).
        /// </summary>
        [HttpGet("export/excel")]
        [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ExportExcel(
            [FromQuery] int? userId,
            [FromQuery] string? batchId,
            [FromQuery] DateTime? dateFrom,
            [FromQuery] DateTime? dateTo)
        {
            var filter = new HistoryFilterRequest
            {
                UserId = userId,
                BatchId = batchId,
                DateFrom = dateFrom,
                DateTo = dateTo
            };

            try
            {
                var data = await _historyFlujo.GetHistoryAsync(filter);
                if (data == null || !data.Any())
                    return NoContent();

                var excelBytes = GenerateExcelHtml(data);
                var fileName = $"historial_{DateTime.Now:yyyyMMdd_HHmmss}.xls";
                return File(excelBytes, "application/vnd.ms-excel", fileName);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        #region Private Helpers

        private static byte[] GenerateCsv(IEnumerable<CompletedTaskHistoryDto> data)
        {
            var sb = new StringBuilder();
            // Header
            sb.AppendLine("TaskId,TaskDescription,Responsible,CompletedByUserId,CompletedByUserName,CompletedAt,EvidenceId,EvidenceFileName,BatchId");

            // Rows
            foreach (var item in data)
            {
                // Escape fields that may contain commas or quotes
                string Escape(string? s) => "\"" + (s ?? "").Replace("\"", "\"\"") + "\"";

                sb.AppendLine(
                    $"{item.TaskId}," +
                    $"{Escape(item.TaskDescription)}," +
                    $"{Escape(item.Responsible)}," +
                    $"{item.CompletedByUserId}," +
                    $"{Escape(item.CompletedByUserName)}," +
                    $"{item.CompletedAt:yyyy-MM-dd HH:mm:ss}," +
                    $"{item.EvidenceId}," +
                    $"{Escape(item.EvidenceFileName)}," +
                    $"{Escape(item.BatchId)}"
                );
            }

            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        private static byte[] GenerateExcelHtml(IEnumerable<CompletedTaskHistoryDto> data)
        {
            var sb = new StringBuilder();
            sb.AppendLine("<html><head><meta charset='UTF-8'></head><body>");
            sb.AppendLine("<table border='1'>");
            sb.AppendLine("<tr>" +
                          "<th>TaskId</th>" +
                          "<th>TaskDescription</th>" +
                          "<th>Responsible</th>" +
                          "<th>CompletedByUserId</th>" +
                          "<th>CompletedByUserName</th>" +
                          "<th>CompletedAt</th>" +
                          "<th>EvidenceId</th>" +
                          "<th>EvidenceFileName</th>" +
                          "<th>BatchId</th>" +
                          "</tr>");

            static string HtmlEncode(string? s) =>
                (s ?? "")
                .Replace("&", "&amp;")
                .Replace("<", "&lt;")
                .Replace(">", "&gt;")
                .Replace("\"", "&quot;");

            foreach (var item in data)
            {
                sb.AppendLine("<tr>");
                sb.AppendLine($"<td>{item.TaskId}</td>");
                sb.AppendLine($"<td>{HtmlEncode(item.TaskDescription)}</td>");
                sb.AppendLine($"<td>{HtmlEncode(item.Responsible)}</td>");
                sb.AppendLine($"<td>{item.CompletedByUserId}</td>");
                sb.AppendLine($"<td>{HtmlEncode(item.CompletedByUserName)}</td>");
                sb.AppendLine($"<td>{item.CompletedAt:yyyy-MM-dd HH:mm:ss}</td>");
                sb.AppendLine($"<td>{item.EvidenceId}</td>");
                sb.AppendLine($"<td>{HtmlEncode(item.EvidenceFileName)}</td>");
                sb.AppendLine($"<td>{HtmlEncode(item.BatchId)}</td>");
                sb.AppendLine("</tr>");
            }

            sb.AppendLine("</table></body></html>");
            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        #endregion
    }
}