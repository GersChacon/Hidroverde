using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DA
{
    // Equivalente a UsuarioDA de la referencia
    public class EmpleadoAuthDA : IEmpleadoAuthDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public EmpleadoAuthDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        // Equivalente a ObtenerUsuario
        public async Task<EmpleadoAuth> ObtenerEmpleadoAuth(EmpleadoAuthBase empleado)
        {
            var resultado = await _sqlConnection.QueryAsync<EmpleadoAuth>(
                "ObtenerEmpleadoLogin",
                new { usuario_sistema = empleado.UsuarioSistema, email = empleado.Email },
                commandType: CommandType.StoredProcedure);
            return resultado.FirstOrDefault();
        }

        // Equivalente a ObtenerPerfilesxUsuario
        public async Task<IEnumerable<RolResponse>> ObtenerRolesxEmpleado(EmpleadoAuthBase empleado)
        {
            var resultado = await _sqlConnection.QueryAsync<RolResponse>(
                "ObtenerRolesxEmpleadoLogin",
                new { usuario_sistema = empleado.UsuarioSistema },
                commandType: CommandType.StoredProcedure);
            return resultado;
        }

        // Equivalente a CrearUsuario
        // Actualiza clave_hash y email en un empleado ya existente
        // (el empleado lo crea el admin desde EmpleadoController)
        public async Task<int> RegistrarEmpleadoAuth(EmpleadoAuthBase empleado)
        {
            var resultado = await _sqlConnection.ExecuteScalarAsync<int>(
                "RegistrarEmpleadoAuth",
                new
                {
                    usuario_sistema = empleado.UsuarioSistema,
                    clave_hash      = empleado.ClaveHash,
                    email           = empleado.Email
                },
                commandType: CommandType.StoredProcedure);
            return resultado;
        }
    }
}
