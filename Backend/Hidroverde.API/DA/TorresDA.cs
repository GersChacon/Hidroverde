using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DA
{
    public class TorresDA : ITorresDA
    {
        private readonly IRepositorioDapper _repositorioDapper;

        public TorresDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
        }

        public async Task<IEnumerable<TorreDto>> Listar()
        {
            using var conn = _repositorioDapper.ObtenerRepositorio();
            return await conn.QueryAsync<TorreDto>("sp_Torres_Listar", commandType: CommandType.StoredProcedure);
        }
    }
}