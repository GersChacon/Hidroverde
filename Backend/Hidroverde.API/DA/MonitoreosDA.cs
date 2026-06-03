using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using DA.Repositorios;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DA
{
    public class MonitoreosDA : IMonitoreosDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public MonitoreosDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<int> Registrar(int responsableId, MonitoreoRegistrarRequest request)
        {
            return await _sqlConnection.ExecuteScalarAsync<int>(
                "dbo.sp_Monitoreo_Registrar",
                new
                {
                    ciclo_id = request.CicloId,
                    responsable_id = responsableId,
                    ph_medido = request.PhMedido,
                    ec_medido = request.EcMedido,
                    temperatura_agua = request.TemperaturaAgua,
                    temperatura_ambiente = request.TemperaturaAmbiente,
                    humedad_ambiente = request.HumedadAmbiente,
                    altura_promedio_plantas = request.AlturaPromedioPlantas,
                    observaciones = request.Observaciones
                },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<IEnumerable<MonitoreoResponse>> Listar(int? cicloId, DateTime? fechaDesde, DateTime? fechaHasta)
        {
            return await _sqlConnection.QueryAsync<MonitoreoResponse>(
                "dbo.sp_Monitoreos_Listar",
                new { ciclo_id = cicloId, fecha_desde = fechaDesde, fecha_hasta = fechaHasta },
                commandType: CommandType.StoredProcedure
            );
        }
    }
}
