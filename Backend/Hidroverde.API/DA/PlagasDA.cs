using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos.Plagas;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DA
{
    public class PlagasDA : IPlagasDA
    {
        private readonly IRepositorioDapper _repositorioDapper;

        public PlagasDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
        }

        public async Task<IEnumerable<PlagaCatalogoDto>> CatalogoListar()
        {
            using var conn = _repositorioDapper.ObtenerRepositorio();
            return await conn.QueryAsync<PlagaCatalogoDto>("sp_Plagas_Catalogo", commandType: CommandType.StoredProcedure);
        }

        public async Task<int> Registrar(int usuarioId, PlagaRegistrarRequest request)
        {
            using var conn = _repositorioDapper.ObtenerRepositorio();
            return await conn.ExecuteScalarAsync<int>("sp_Plagas_Registrar",
                new { usuarioId, request.PlagaId, request.FechaHallazgo, request.Cantidad, request.Comentario },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<PlagaRegistroDto>> Listar(DateTime? fechaDesde, DateTime? fechaHasta, int? plagaId)
        {
            using var conn = _repositorioDapper.ObtenerRepositorio();
            return await conn.QueryAsync<PlagaRegistroDto>("sp_Plagas_Listar",
                new { fechaDesde, fechaHasta, plagaId }, commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<PlagaGraficaItemDto>> Grafica(DateTime? fechaDesde, DateTime? fechaHasta, int? plagaId, string agrupacion)
        {
            using var conn = _repositorioDapper.ObtenerRepositorio();
            return await conn.QueryAsync<PlagaGraficaItemDto>("sp_Plagas_Grafica",
                new { fechaDesde, fechaHasta, plagaId, agrupacion }, commandType: CommandType.StoredProcedure);
        }
    }
}