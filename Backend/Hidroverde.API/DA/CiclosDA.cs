using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using DA.Repositorios;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DA
{
    public class CiclosDA : ICiclosDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public CiclosDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<IEnumerable<CicloActivoResponse>> ObtenerActivos()
        {
            const string sp = "dbo.sp_Ciclos_ListarActivos";
            var resultado = await _sqlConnection.QueryAsync<CicloActivoResponse>(
                sp,
                commandType: CommandType.StoredProcedure
            );
            return resultado;
        }
    }
}
