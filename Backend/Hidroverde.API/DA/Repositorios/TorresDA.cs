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
        private readonly IDbConnection _sqlConnection;

        public TorresDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task < IEnumerable < TorreDto >> Listar()
{
    return await _sqlConnection.QueryAsync<TorreDto>(
        "dbo.sp_Torres_Disponibilidad_Listar",
        commandType: CommandType.StoredProcedure
    );
    }
}
}