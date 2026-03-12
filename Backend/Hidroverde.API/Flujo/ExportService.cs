using Abstracciones.Interfaces.Servicios;
using OfficeOpenXml;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.ComponentModel;
using System.Reflection.Metadata;
using System.Text;
using System.Text.Json;

namespace Flujo
{
    public class ExportService : IExportService
    {
        public byte[] GenerarExcel(string nombreHoja, IEnumerable<dynamic> datos)
        {
            // Ensure EPPlus license context (required for non-commercial use)
            ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add(nombreHoja);

            // If there is data, write headers and rows
            var list = datos.ToList();
            if (list.Any())
            {
                // Get the first item's properties (assuming all items have same structure)
                var first = list.First() as IDictionary<string, object>;
                if (first != null)
                {
                    var headers = first.Keys.ToList();
                    // Write headers
                    for (int i = 0; i < headers.Count; i++)
                    {
                        worksheet.Cells[1, i + 1].Value = headers[i];
                    }
                    // Write rows
                    int row = 2;
                    foreach (var item in list)
                    {
                        var dict = item as IDictionary<string, object>;
                        if (dict != null)
                        {
                            for (int i = 0; i < headers.Count; i++)
                            {
                                var val = dict[headers[i]];
                                worksheet.Cells[row, i + 1].Value = val?.ToString();
                            }
                            row++;
                        }
                    }
                }
            }
            else
            {
                worksheet.Cells[1, 1].Value = "No hay datos";
            }

            // Auto fit columns
            worksheet.Cells.AutoFitColumns();
            return package.GetAsByteArray();
        }

        public byte[] GenerarPDF(string titulo, IEnumerable<dynamic> datos, Dictionary<string, string>? metadatos = null)
        {
            // Convert dynamic data to a list of dictionaries for easier rendering
            var list = datos.Select(d => (IDictionary<string, object>)d).ToList();

            var document = QuestPDF.Fluent.Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.Header().Text(titulo).SemiBold().FontSize(18);

                    page.Content().Table(table =>
                    {
                        if (list.Any())
                        {
                            // Define columns based on first item's keys
                            var headers = list.First().Keys.ToList();
                            table.ColumnsDefinition(columns =>
                            {
                                foreach (var _ in headers)
                                    columns.RelativeColumn();
                            });

                            // Header row
                            table.Header(header =>
                            {
                                foreach (var h in headers)
                                {
                                    header.Cell().Text(h).Bold();
                                }
                            });

                            // Data rows
                            foreach (var row in list)
                            {
                                foreach (var h in headers)
                                {
                                    var value = row.ContainsKey(h) ? row[h]?.ToString() : "";
                                    table.Cell().Text(value ?? "");
                                }
                            }
                        }
                        else
                        {
                            table.ColumnsDefinition(columns => columns.RelativeColumn());
                            table.Cell().Text("No hay datos");
                        }
                    });

                    page.Footer().AlignCenter().Text(x =>
                    {
                        x.CurrentPageNumber();
                        x.Span(" / ");
                        x.TotalPages();
                    });
                });
            });

            return document.GeneratePdf();
        }
    }
}