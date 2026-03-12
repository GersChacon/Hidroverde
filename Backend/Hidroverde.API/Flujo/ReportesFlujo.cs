using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos.Reportes;
using System.Data;
using System.Text.Json;
using Microsoft.Data.SqlClient;
using Dapper;
using Abstracciones.Interfaces.Servicios;

namespace Flujo
{
    public class ReportesFlujo : IReportesFlujo
    {
        private readonly IReportesDA _reportesDA;
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly IExportService _exportService; // lo crearemos luego

        public ReportesFlujo(IReportesDA reportesDA, IRepositorioDapper repositorioDapper, IExportService exportService)
        {
            _reportesDA = reportesDA;
            _repositorioDapper = repositorioDapper;
            _exportService = exportService;
        }

        // Helper para obtener roles del usuario (simplificado; en producción puedes obtener de DB o claims)
        private async Task<List<string>> ObtenerRolesUsuario(int usuarioId)
        {
            // Aquí deberías consultar los roles del empleado desde la base de datos.
            // Por simplicidad, asumimos que el empleado tiene un solo rol y lo obtenemos de Empleados.
            using var conn = _repositorioDapper.ObtenerRepositorio();
            var rol = await conn.QueryFirstOrDefaultAsync<string>(
                @"SELECT r.Nombre 
                  FROM Empleados e
                  INNER JOIN Roles r ON e.rol_id = r.rol_id
                  WHERE e.empleado_id = @usuarioId",
                new { usuarioId });
            return rol != null ? new List<string> { rol } : new List<string>();
        }

        // Verifica si el usuario tiene permiso para acceder a una definición
        private async Task<bool> UsuarioPuedeAccederDefinicion(int usuarioId, ReporteDefinicionDto definicion)
        {
            if (string.IsNullOrEmpty(definicion.RolesPermitidos))
                return false;
            var rolesPermitidos = definicion.RolesPermitidos.Split(',').Select(r => r.Trim()).ToList();
            var rolesUsuario = await ObtenerRolesUsuario(usuarioId);
            return rolesPermitidos.Intersect(rolesUsuario).Any();
        }

        public async Task<IEnumerable<ReporteDefinicionDto>> ObtenerDefiniciones(int usuarioId)
        {
            var todas = await _reportesDA.ObtenerDefiniciones();
            var resultado = new List<ReporteDefinicionDto>();
            foreach (var def in todas)
            {
                if (await UsuarioPuedeAccederDefinicion(usuarioId, def))
                    resultado.Add(def);
            }
            return resultado;
        }

        public async Task<ReporteDefinicionDto?> ObtenerDefinicion(int reporteId, int usuarioId)
        {
            var def = await _reportesDA.ObtenerDefinicion(reporteId);
            if (def == null) return null;
            if (!await UsuarioPuedeAccederDefinicion(usuarioId, def))
                throw new UnauthorizedAccessException("No tiene permiso para acceder a este reporte.");
            return def;
        }

        public async Task<int> CrearProgramacion(ReporteProgramacionDto programacion, int usuarioId)
        {
            // Validar que el reporte existe y el usuario tiene permiso
            var def = await ObtenerDefinicion(programacion.ReporteId, usuarioId);
            if (def == null)
                throw new KeyNotFoundException("Reporte no encontrado o sin permisos.");

            programacion.CreadoPor = usuarioId;
            // Calcular próxima ejecución según frecuencia
            programacion.ProximaEjecucion = CalcularProximaEjecucion(programacion.Frecuencia);
            programacion.Activo = true;
            return await _reportesDA.CrearProgramacion(programacion);
        }

        public async Task EditarProgramacion(int programacionId, ReporteProgramacionDto programacion)
        {
            var progExistente = (await _reportesDA.ListarProgramaciones()).FirstOrDefault(p => p.ProgramacionId == programacionId);
            if (progExistente == null)
                throw new KeyNotFoundException("Programación no encontrada.");
            // Solo el creador puede editar? Podríamos verificar.
            programacion.ProgramacionId = programacionId;
            await _reportesDA.EditarProgramacion(programacion);
        }

        public async Task EliminarProgramacion(int programacionId)
        {
            await _reportesDA.EliminarProgramacion(programacionId);
        }

        public async Task<IEnumerable<ReporteProgramacionDto>> ListarProgramaciones(int usuarioId)
        {
            // Podríamos filtrar por creador, pero por ahora listamos todas (en SP ya filtra por usuario si se pasa)
            return await _reportesDA.ListarProgramaciones(usuarioId);
        }

        public async Task<int> GenerarReporteAhora(int reporteId, string? parametros, int usuarioId)
        {
            var def = await ObtenerDefinicion(reporteId, usuarioId);
            if (def == null)
                throw new UnauthorizedAccessException("No tiene permiso para generar este reporte.");

            // Ejecutar el SP de datos y obtener JSON
            var datosJson = await EjecutarSpYSerializar(def.Procedimiento, parametros);
            var generadoId = await _reportesDA.CrearReporteGenerado(reporteId, datosJson, null);
            return generadoId;
        }

        public async Task<IEnumerable<ReporteGeneradoDto>> ListarGenerados(int usuarioId, int? reporteId)
        {
            // Primero obtener definiciones a las que el usuario tiene acceso
            var definicionesAccesibles = await ObtenerDefiniciones(usuarioId);
            var idsAccesibles = definicionesAccesibles.Select(d => d.ReporteId).ToHashSet();

            var todosGenerados = await _reportesDA.ListarReportesGenerados(reporteId);
            return todosGenerados.Where(g => idsAccesibles.Contains(g.ReporteId)).ToList();
        }

        public async Task<ReporteGeneradoDto?> ObtenerGenerado(int generadoId, int usuarioId)
        {
            var generado = await _reportesDA.ObtenerReporteGenerado(generadoId);
            if (generado == null) return null;
            var def = await _reportesDA.ObtenerDefinicion(generado.ReporteId);
            if (def == null) return null;
            if (!await UsuarioPuedeAccederDefinicion(usuarioId, def))
                throw new UnauthorizedAccessException("No tiene permiso para acceder a este reporte.");
            return generado;
        }

        public async Task<byte[]> ExportarReporte(int generadoId, string formato, int usuarioId)
        {
            var generado = await ObtenerGenerado(generadoId, usuarioId);
            if (generado == null)
                throw new KeyNotFoundException("Reporte no encontrado.");

            // Parsear JSON a objeto para exportar
            var datos = JsonSerializer.Deserialize<IEnumerable<dynamic>>(generado.DatosJson) ?? new List<dynamic>();

            byte[] archivo;
            if (formato.ToLower() == "pdf")
                archivo = _exportService.GenerarPDF($"Reporte {generado.ReporteNombre}", datos, new Dictionary<string, string>());
            else if (formato.ToLower() == "excel")
                archivo = _exportService.GenerarExcel($"Reporte", datos);
            else
                throw new ArgumentException("Formato no soportado");

            // Registrar exportación
            await _reportesDA.InsertarExportLog(generadoId, usuarioId, formato.ToUpper());

            return archivo;
        }

        public async Task<IEnumerable<ReporteProgramacionDto>> ObtenerProgramacionesVencidas()
        {
            return await _reportesDA.ObtenerProgramacionesVencidas();
        }

        public async Task<int> GenerarReporteProgramado(int programacionId)
        {
            var programaciones = await _reportesDA.ListarProgramaciones();
            var prog = programaciones.FirstOrDefault(p => p.ProgramacionId == programacionId);
            if (prog == null) return 0;

            var def = await _reportesDA.ObtenerDefinicion(prog.ReporteId);
            if (def == null) return 0;

            // Ejecutar SP con parámetros guardados
            var datosJson = await EjecutarSpYSerializar(def.Procedimiento, prog.Parametros);
            var generadoId = await _reportesDA.CrearReporteGenerado(prog.ReporteId, datosJson, programacionId);

            // Actualizar próxima ejecución
            prog.ProximaEjecucion = CalcularProximaEjecucion(prog.Frecuencia, prog.ProximaEjecucion);
            await _reportesDA.EditarProgramacion(prog);

            // Aquí podrías enviar notificación (opcional)
            return generadoId;
        }

        private DateTime CalcularProximaEjecucion(string frecuencia, DateTime? desde = null)
        {
            var baseDate = desde ?? DateTime.Now;
            return frecuencia.ToUpper() switch
            {
                "DIARIO" => baseDate.AddDays(1).Date,
                "SEMANAL" => baseDate.AddDays(7).Date,
                "MENSUAL" => baseDate.AddMonths(1).Date,
                _ => baseDate.AddDays(1)
            };
        }

        private async Task<string> EjecutarSpYSerializar(string spName, string? parametrosJson)
        {
            using var conn = _repositorioDapper.ObtenerRepositorio();
            // Parsear parámetros si vienen
            var parametros = new DynamicParameters();
            if (!string.IsNullOrEmpty(parametrosJson))
            {
                var dict = JsonSerializer.Deserialize<Dictionary<string, object>>(parametrosJson);
                if (dict != null)
                {
                    foreach (var kv in dict)
                    {
                        // Asumimos que los parámetros son tipos simples (int, date, string)
                        parametros.Add($"@{kv.Key}", kv.Value?.ToString());
                    }
                }
            }

            var result = await conn.QueryAsync(spName, parametros, commandType: CommandType.StoredProcedure);
            return JsonSerializer.Serialize(result);
        }
    }
}