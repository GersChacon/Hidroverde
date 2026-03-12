using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abstracciones.Modelos.Reportes;

namespace Abstracciones.Interfaces.Flujo
{
    public interface IReportesFlujo
    {
        // Definiciones
        Task<IEnumerable<ReporteDefinicionDto>> ObtenerDefiniciones(int usuarioId);
        Task<ReporteDefinicionDto?> ObtenerDefinicion(int reporteId, int usuarioId);

        // Programaciones
        Task<int> CrearProgramacion(ReporteProgramacionDto programacion, int usuarioId);
        Task EditarProgramacion(int programacionId, ReporteProgramacionDto programacion);
        Task EliminarProgramacion(int programacionId);
        Task<IEnumerable<ReporteProgramacionDto>> ListarProgramaciones(int usuarioId);

        // Generación manual
        Task<int> GenerarReporteAhora(int reporteId, string? parametros, int usuarioId);

        // Reportes generados
        Task<IEnumerable<ReporteGeneradoDto>> ListarGenerados(int usuarioId, int? reporteId);
        Task<ReporteGeneradoDto?> ObtenerGenerado(int generadoId, int usuarioId);

        // Exportación
        Task<byte[]> ExportarReporte(int generadoId, string formato, int usuarioId);

        // Para servicio background
        Task<IEnumerable<ReporteProgramacionDto>> ObtenerProgramacionesVencidas();
        Task<int> GenerarReporteProgramado(int programacionId);
    }
}