using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DA
{
    public class EmpleadoDA : IEmpleadoDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public EmpleadoDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<IEnumerable<EmpleadoResponse>> Obtener() =>
            await _sqlConnection.QueryAsync<EmpleadoResponse>("ObtenerEmpleados", commandType: CommandType.StoredProcedure);

        public async Task<EmpleadoResponse> Obtener(int empleadoId) =>
            await _sqlConnection.QueryFirstOrDefaultAsync<EmpleadoResponse>(
                "ObtenerEmpleado", new { empleado_id = empleadoId }, commandType: CommandType.StoredProcedure);

        public async Task<int> Agregar(EmpleadoRequest empleado) =>
            await _sqlConnection.ExecuteScalarAsync<int>("AgregarEmpleado",
                new
                {
                    rol_id = empleado.RolId,
                    cedula = empleado.Cedula,
                    nombre = empleado.Nombre,
                    apellidos = empleado.Apellidos,
                    telefono = empleado.Telefono,
                    email = empleado.Email,
                    fecha_nacimiento = empleado.FechaNacimiento,
                    fecha_contratacion = empleado.FechaContratacion,
                    usuario_sistema = empleado.UsuarioSistema,
                    clave_hash = empleado.ClaveHash,
                    activo = empleado.Activo,
                    estado = empleado.Estado
                },
                commandType: CommandType.StoredProcedure);

        public async Task<int> Editar(int empleadoId, EmpleadoRequest empleado)
        {
            await VerificarExiste(empleadoId);
            return await _sqlConnection.ExecuteScalarAsync<int>("EditarEmpleado",
                new
                {
                    empleado_id = empleadoId,
                    rol_id = empleado.RolId,
                    cedula = empleado.Cedula,
                    nombre = empleado.Nombre,
                    apellidos = empleado.Apellidos,
                    telefono = empleado.Telefono,
                    email = empleado.Email,
                    fecha_nacimiento = empleado.FechaNacimiento,
                    fecha_contratacion = empleado.FechaContratacion,
                    usuario_sistema = empleado.UsuarioSistema,
                    activo = empleado.Activo,
                    estado = empleado.Estado
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<int> CambiarEstado(int empleadoId, string estado)
        {
            await VerificarExiste(empleadoId);
            return await _sqlConnection.ExecuteScalarAsync<int>("CambiarEstadoEmpleado",
                new { empleado_id = empleadoId, estado },
                commandType: CommandType.StoredProcedure);
        }

        private async Task VerificarExiste(int empleadoId)
        {
            if (await Obtener(empleadoId) == null)
                throw new KeyNotFoundException($"No se encontró el empleado con ID {empleadoId}");
        }
    }
}