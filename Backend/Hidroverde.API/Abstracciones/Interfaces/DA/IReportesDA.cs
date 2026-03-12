using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abstracciones.Modelos.Reportes;

namespace Abstracciones.Interfaces.DA
{
    public interface IReportesDA
    {
        // Definiciones
        Task<IEnumerable<ReporteDefinicionDto>> ObtenerDefiniciones();
        Task<ReporteDefinicionDto?> ObtenerDefinicion(int reporteId);

        // Programaciones
        Task<int> CrearProgramacion(ReporteProgramacionDto programacion);
        Task EditarProgramacion(ReporteProgramacionDto programacion);
        Task EliminarProgramacion(int programacionId);
        Task<IEnumerable<ReporteProgramacionDto>> ListarProgramaciones(int? usuarioId = null);
        Task<IEnumerable<ReporteProgramacionDto>> ObtenerProgramacionesVencidas();

        // Reportes generados
        Task<int> CrearReporteGenerado(int reporteId, string datosJson, int? programacionId = null);
        Task<IEnumerable<ReporteGeneradoDto>> ListarReportesGenerados(int? reporteId = null);
        Task<ReporteGeneradoDto?> ObtenerReporteGenerado(int generadoId);

        // Export log
        Task InsertarExportLog(int reporteGeneradoId, int usuarioId, string formato);
    }
}