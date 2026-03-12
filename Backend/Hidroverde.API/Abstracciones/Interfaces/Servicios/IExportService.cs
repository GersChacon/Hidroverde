using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Interfaces.Servicios
{
    public interface IExportService
    {
        byte[] GenerarExcel(string nombreHoja, IEnumerable<dynamic> datos);
        byte[] GenerarPDF(string titulo, IEnumerable<dynamic> datos, Dictionary<string, string>? metadatos = null);
    }
}