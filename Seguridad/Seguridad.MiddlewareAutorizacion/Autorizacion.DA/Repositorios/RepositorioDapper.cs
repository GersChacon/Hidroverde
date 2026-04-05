using Autorizacion.Abstracciones.DA;
using Microsoft.Extensions.Configuration;
using System.Data.SqlClient;

namespace Autorizacion.DA.Repositorios
{
    public class RepositorioDapper : IRepositorioDapper
    {
        private readonly SqlConnection _connection;

        public RepositorioDapper(IConfiguration configuration)
        {
            _connection = new SqlConnection(configuration.GetConnectionString("BD"));
        }

        public SqlConnection ObtenerRepositorioDapper() => _connection;
    }
}
