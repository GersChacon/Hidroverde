using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abstracciones.Interfaces.Servicios;


namespace Flujo
{
    public class ExportService : IExportService
    {
        public byte[] GenerarExcel(string nombreHoja, IEnumerable<dynamic> datos)
        {
            // Simple HTML table that Excel can open
            var sb = new StringBuilder();
            sb.AppendLine("<html><head><meta charset='UTF-8'></head><body>");
            sb.AppendLine($"<h3>{nombreHoja}</h3>");
            sb.AppendLine("<table border='1'>");
            sb.AppendLine("<tr><th>ID</th><th>Fecha</th><th>Total</th></tr>");
            sb.AppendLine("<tr><td>1</td><td>2025-01-01</td><td>150000</td></tr>");
            sb.AppendLine("</table></body></html>");
            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        public byte[] GenerarPDF(string titulo, IEnumerable<dynamic> datos, Dictionary<string, string>? metadatos = null)
        {
            // Minimal valid PDF stub
            string pdfContent = @"%PDF-1.4
            1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
            2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
            3 0 obj<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Resources<<>>>>endobj
            trailer<</Size 4/Root 1 0 R>>";
            return Encoding.UTF8.GetBytes(pdfContent);
        }
    }
}