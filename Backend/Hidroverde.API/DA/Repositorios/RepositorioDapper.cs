using Abstracciones.Interfaces.DA;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace DA.Repositorios
{
    public class RepositorioDapper : IRepositorioDapper
    {
        private readonly IConfiguration _config;

        public RepositorioDapper(IConfiguration config)
        {
            _config = config;
        }

        public SqlConnection ObtenerRepositorio()
        {
            return new SqlConnection(_config.GetConnectionString("BD"));
        }
    }
}
