using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos.Reportes;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DA
{
    public class ReportesDA : IReportesDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public ReportesDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<IEnumerable<ReporteDefinicionDto>> ObtenerDefiniciones()
        {
            return await _sqlConnection.QueryAsync<ReporteDefinicionDto>(
                "Reportes_Definicion_Listar",
                commandType: CommandType.StoredProcedure);
        }

        public async Task<ReporteDefinicionDto?> ObtenerDefinicion(int reporteId)
        {
            return await _sqlConnection.QueryFirstOrDefaultAsync<ReporteDefinicionDto>(
                "Reportes_Definicion_Obtener",
                new { reporte_id = reporteId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<int> CrearProgramacion(ReporteProgramacionDto programacion)
        {
            var id = await _sqlConnection.ExecuteScalarAsync<int>(
                "Reportes_Programacion_Crear",
                new
                {
                    reporte_id = programacion.ReporteId,
                    frecuencia = programacion.Frecuencia,
                    parametros = programacion.Parametros,
                    proxima_ejecucion = programacion.ProximaEjecucion,
                    creado_por = programacion.CreadoPor
                },
                commandType: CommandType.StoredProcedure);
            return id;
        }

        public async Task EditarProgramacion(ReporteProgramacionDto programacion)
        {
            await _sqlConnection.ExecuteAsync(
                "Reportes_Programacion_Editar",
                new
                {
                    programacion_id = programacion.ProgramacionId,
                    reporte_id = programacion.ReporteId,
                    frecuencia = programacion.Frecuencia,
                    parametros = programacion.Parametros,
                    proxima_ejecucion = programacion.ProximaEjecucion,
                    activo = programacion.Activo
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task EliminarProgramacion(int programacionId)
        {
            await _sqlConnection.ExecuteAsync(
                "Reportes_Programacion_Eliminar",
                new { programacion_id = programacionId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<ReporteProgramacionDto>> ListarProgramaciones(int? usuarioId = null)
        {
            return await _sqlConnection.QueryAsync<ReporteProgramacionDto>(
                "Reportes_Programacion_Listar",
                new { usuario_id = usuarioId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<ReporteProgramacionDto>> ObtenerProgramacionesVencidas()
        {
            return await _sqlConnection.QueryAsync<ReporteProgramacionDto>(
                "Reportes_Programacion_Vencidas",
                commandType: CommandType.StoredProcedure);
        }

        public async Task<int> CrearReporteGenerado(int reporteId, string datosJson, int? programacionId = null)
        {
            var id = await _sqlConnection.ExecuteScalarAsync<int>(
                "Reportes_Generados_Crear",
                new
                {
                    reporte_id = reporteId,
                    datos_json = datosJson,
                    programacion_id = programacionId
                },
                commandType: CommandType.StoredProcedure);
            return id;
        }

        public async Task<IEnumerable<ReporteGeneradoDto>> ListarReportesGenerados(int? reporteId = null)
        {
            // Nota: este SP no necesita usuarioId porque se filtra después en flujo según roles.
            return await _sqlConnection.QueryAsync<ReporteGeneradoDto>(
                "Reportes_Generados_Listar",
                new { reporte_id = reporteId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<ReporteGeneradoDto?> ObtenerReporteGenerado(int generadoId)
        {
            return await _sqlConnection.QueryFirstOrDefaultAsync<ReporteGeneradoDto>(
                "Reportes_Generados_Obtener",
                new { generado_id = generadoId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task InsertarExportLog(int reporteGeneradoId, int usuarioId, string formato)
        {
            await _sqlConnection.ExecuteAsync(
                "Reportes_ExportLog_Insertar",
                new
                {
                    reporte_generado_id = reporteGeneradoId,
                    usuario_id = usuarioId,
                    formato = formato
                },
                commandType: CommandType.StoredProcedure);
        }
    }
}