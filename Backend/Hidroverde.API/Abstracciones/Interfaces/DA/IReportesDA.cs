using Abstracciones.Modelos.Reportes;

namespace Abstracciones.Interfaces.DA
{
    public interface IReportesDA
    {
        Task<IEnumerable<ReporteDefinicionDto>> ObtenerDefiniciones();
        Task<ReporteDefinicionDto?> ObtenerDefinicion(int reporteId);
        Task<int> CrearProgramacion(ReporteProgramacionDto programacion);
        Task EditarProgramacion(ReporteProgramacionDto programacion);
        Task EliminarProgramacion(int programacionId);
        Task<IEnumerable<ReporteProgramacionDto>> ListarProgramaciones(int? usuarioId = null);
        Task<IEnumerable<ReporteProgramacionDto>> ObtenerProgramacionesVencidas();
        Task<int> CrearReporteGenerado(int reporteId, string datosJson, int? programacionId = null);
        Task<IEnumerable<ReporteGeneradoDto>> ListarReportesGenerados(int? reporteId = null);
        Task<ReporteGeneradoDto?> ObtenerReporteGenerado(int generadoId);
        Task InsertarExportLog(int reporteGeneradoId, int usuarioId, string formato);
    }
}