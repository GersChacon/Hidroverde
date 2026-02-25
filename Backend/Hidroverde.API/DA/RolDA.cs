using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DA
{
    public class RolDA : IRolDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public RolDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<IEnumerable<RolResponse>> Obtener() =>
            await _sqlConnection.QueryAsync<RolResponse>("ObtenerRoles", commandType: CommandType.StoredProcedure);

        public async Task<RolResponse> Obtener(int rolId) =>
            await _sqlConnection.QueryFirstOrDefaultAsync<RolResponse>(
                "ObtenerRol", new { rol_id = rolId }, commandType: CommandType.StoredProcedure);

        public async Task<int> Agregar(RolRequest rol) =>
            await _sqlConnection.ExecuteScalarAsync<int>("AgregarRol",
                new { codigo = rol.Codigo, nombre = rol.Nombre, nivel_acceso = rol.NivelAcceso, descripcion = rol.Descripcion, activo = rol.Activo },
                commandType: CommandType.StoredProcedure);

        public async Task<int> Editar(int rolId, RolRequest rol)
        {
            await VerificarExiste(rolId);
            return await _sqlConnection.ExecuteScalarAsync<int>("EditarRol",
                new { rol_id = rolId, codigo = rol.Codigo, nombre = rol.Nombre, nivel_acceso = rol.NivelAcceso, descripcion = rol.Descripcion, activo = rol.Activo },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<int> Eliminar(int rolId)
        {
            await VerificarExiste(rolId);
            return await _sqlConnection.ExecuteScalarAsync<int>("EliminarRol", new { rol_id = rolId }, commandType: CommandType.StoredProcedure);
        }

        private async Task VerificarExiste(int rolId)
        {
            if (await Obtener(rolId) == null)
                throw new KeyNotFoundException($"No se encontró el rol con ID {rolId}");
        }
    }
}