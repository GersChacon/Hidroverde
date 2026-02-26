using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos.Plagas;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DA.Repositorios
{
    public class PlagasDA : IPlagasDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public PlagasDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<IEnumerable<PlagaCatalogoDto>> CatalogoListar()
        {
            return await _sqlConnection.QueryAsync<PlagaCatalogoDto>(
                "dbo.sp_Plagas_Catalogo_Listar",
                commandType: CommandType.StoredProcedure);
        }

        public async Task<int> Registrar(int usuarioId, PlagaRegistrarRequest request)
        {
            var p = new DynamicParameters();
            p.Add("@plaga_id", request.PlagaId);
            p.Add("@fecha_hallazgo", request.FechaHallazgo.Date);
            p.Add("@cantidad", request.Cantidad ?? 1);
            p.Add("@comentario", request.Comentario);
            p.Add("@usuario_id", usuarioId);

            return await _sqlConnection.ExecuteScalarAsync<int>(
                "dbo.sp_Plagas_Registrar",
                p,
                commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<PlagaRegistroDto>> Listar(DateTime? fechaDesde, DateTime? fechaHasta, int? plagaId)
        {
            var p = new DynamicParameters();
            p.Add("@fecha_desde", fechaDesde?.Date);
            p.Add("@fecha_hasta", fechaHasta?.Date);
            p.Add("@plaga_id", plagaId);

            return await _sqlConnection.QueryAsync<PlagaRegistroDto>(
                "dbo.sp_Plagas_Listar",
                p,
                commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<PlagaGraficaItemDto>> Grafica(DateTime? fechaDesde, DateTime? fechaHasta, int? plagaId, string agrupacion)
        {
            agrupacion = (agrupacion ?? "DIA").Trim().ToUpperInvariant();
            if (agrupacion != "DIA" && agrupacion != "MES" && agrupacion != "ANIO")
                agrupacion = "DIA";

            var p = new DynamicParameters();
            p.Add("@fecha_desde", fechaDesde?.Date);
            p.Add("@fecha_hasta", fechaHasta?.Date);
            p.Add("@plaga_id", plagaId);
            p.Add("@agrupacion", agrupacion);

            return await _sqlConnection.QueryAsync<PlagaGraficaItemDto>(
                "dbo.sp_Plagas_Grafica",
                p,
                commandType: CommandType.StoredProcedure);
        }
    }
}