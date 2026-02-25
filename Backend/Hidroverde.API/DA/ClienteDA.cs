using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos.Cliente;
using Dapper;
using Microsoft.Data.SqlClient;

namespace DA
{
    public class ClienteDA : IClienteDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public ClienteDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<int> Agregar(ClienteRequest request)
        {
            const string sp = "dbo.sp_Cliente_Insert"; // Asumimos SP
            var id = await _sqlConnection.ExecuteScalarAsync<int>(sp, new
            {
                nombreRazonSocial = request.NombreRazonSocial,
                email = request.Email,
                telefono = request.Telefono,
                direccion = request.Direccion,
                tipoCliente = request.TipoCliente,
                identificadorUnico = request.IdentificadorUnico
            }, commandType: System.Data.CommandType.StoredProcedure);
            return id;
        }

        public async Task<int> Editar(int clienteId, ClienteRequest request)
        {
            const string sp = "dbo.sp_Cliente_Update";
            return await _sqlConnection.ExecuteAsync(sp, new
            {
                clienteId,
                nombreRazonSocial = request.NombreRazonSocial,
                email = request.Email,
                telefono = request.Telefono,
                direccion = request.Direccion,
                tipoCliente = request.TipoCliente,
                identificadorUnico = request.IdentificadorUnico
            }, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<int> Eliminar(int clienteId)
        {
            const string sp = "dbo.sp_Cliente_Delete";
            return await _sqlConnection.ExecuteAsync(sp, new { clienteId }, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<ClienteResponse?> ObtenerPorId(int clienteId)
        {
            const string sp = "dbo.sp_Cliente_GetById";
            return await _sqlConnection.QueryFirstOrDefaultAsync<ClienteResponse>(sp, new { clienteId }, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<ClienteResponse>> ObtenerTodos(ClienteFilter? filtro = null)
        {
            const string sp = "dbo.sp_Cliente_List";
            return await _sqlConnection.QueryAsync<ClienteResponse>(sp, filtro, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<bool> ExisteIdentificador(string identificador, int? excludeId = null)
        {
            const string sp = "dbo.sp_Cliente_ExisteIdentificador";
            var count = await _sqlConnection.ExecuteScalarAsync<int>(sp, new { identificador, excludeId }, commandType: System.Data.CommandType.StoredProcedure);
            return count > 0;
        }
    }
}