using Autorizacion.Abstracciones.DA;
using Autorizacion.Abstracciones.Modelos;
using Dapper;
using System.Data;
using System.Data.SqlClient;

namespace Autorizacion.DA
{
    public class SeguridadDA : ISeguridadDA
    {
        private readonly SqlConnection _sqlConnection;

        public SeguridadDA(IRepositorioDapper repositorioDapper)
        {
            _sqlConnection = repositorioDapper.ObtenerRepositorioDapper();
        }

        public async Task<Empleado> ObtenerInformacionEmpleado(Empleado empleado)
        {
            var resultado = await _sqlConnection.QueryAsync<Empleado>(
                "ObtenerEmpleadoLogin",
                new { usuario_sistema = empleado.UsuarioSistema, email = empleado.Email },
                commandType: CommandType.StoredProcedure);
            return resultado.FirstOrDefault();
        }

        public async Task<IEnumerable<Rol>> ObtenerRolesxEmpleado(Empleado empleado)
        {
            var resultado = await _sqlConnection.QueryAsync<Rol>(
                "ObtenerRolesxEmpleadoLogin",
                new { usuario_sistema = empleado.UsuarioSistema },
                commandType: CommandType.StoredProcedure);
            return resultado;
        }
    }
}
