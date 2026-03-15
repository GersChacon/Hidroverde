using Abstracciones.Modelos.Reportes;

namespace Abstracciones.Interfaces.Flujo
{
    public interface IReportesFlujo
    {
        Task<IEnumerable<ReporteDefinicionDto>> ObtenerDefiniciones(int usuarioId);
        Task<ReporteDefinicionDto?> ObtenerDefinicion(int reporteId, int usuarioId);
        Task<int> CrearProgramacion(ReporteProgramacionDto programacion, int usuarioId);
        Task EditarProgramacion(int programacionId, ReporteProgramacionDto programacion);
        Task EliminarProgramacion(int programacionId);
        Task<IEnumerable<ReporteProgramacionDto>> ListarProgramaciones(int usuarioId);
        Task<int> GenerarReporteAhora(int reporteId, string? parametros, int usuarioId);
        Task<IEnumerable<ReporteGeneradoDto>> ListarGenerados(int usuarioId, int? reporteId);
        Task<ReporteGeneradoDto?> ObtenerGenerado(int generadoId, int usuarioId);
        Task<byte[]> ExportarReporte(int generadoId, string formato, int usuarioId);
        Task<IEnumerable<ReporteProgramacionDto>> ObtenerProgramacionesVencidas();
        Task<int> GenerarReporteProgramado(int programacionId);
    }
}