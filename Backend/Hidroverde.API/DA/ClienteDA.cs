using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos.Cliente;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DA
{
    public class ClienteDA : IClienteDA
    {
        private readonly IRepositorioDapper _repositorioDapper;

        public ClienteDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
        }

        public async Task<int> Agregar(ClienteRequest request)
        {
            using var connection = _repositorioDapper.ObtenerRepositorio();
            const string sp = "dbo.sp_Cliente_Insert";
            var id = await connection.ExecuteScalarAsync<int>(sp, new
            {
                nombreRazonSocial = request.NombreRazonSocial,
                email = request.Email,
                telefono = request.Telefono,
                direccion = request.Direccion,
                tipoCliente = request.TipoCliente,
                identificadorUnico = request.IdentificadorUnico
            }, commandType: CommandType.StoredProcedure);
            return id;
        }

        public async Task<int> Editar(int clienteId, ClienteRequest request)
        {
            using var connection = _repositorioDapper.ObtenerRepositorio();
            const string sp = "dbo.sp_Cliente_Update";
            return await connection.ExecuteAsync(sp, new
            {
                clienteId,
                nombreRazonSocial = request.NombreRazonSocial,
                email = request.Email,
                telefono = request.Telefono,
                direccion = request.Direccion,
                tipoCliente = request.TipoCliente,
                identificadorUnico = request.IdentificadorUnico
            }, commandType: CommandType.StoredProcedure);
        }

        public async Task<int> Eliminar(int clienteId)
        {
            using var connection = _repositorioDapper.ObtenerRepositorio();
            const string sp = "dbo.sp_Cliente_Delete";
            return await connection.ExecuteAsync(sp, new { clienteId }, commandType: CommandType.StoredProcedure);
        }

        public async Task<ClienteResponse?> ObtenerPorId(int clienteId)
        {
            using var connection = _repositorioDapper.ObtenerRepositorio();
            const string sp = "dbo.sp_Cliente_GetById";
            return await connection.QueryFirstOrDefaultAsync<ClienteResponse>(sp, new { clienteId }, commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<ClienteResponse>> ObtenerTodos(ClienteFilter? filtro = null)
        {
            using var connection = _repositorioDapper.ObtenerRepositorio();
            const string sp = "dbo.sp_Cliente_List";

            // The stored procedure doesn't accept parameters, so call it without parameters
            var clientes = await connection.QueryAsync<ClienteResponse>(sp, commandType: CommandType.StoredProcedure);

            // Apply filters in memory if needed
            if (filtro != null)
            {
                var filtered = clientes.AsEnumerable();

                if (!string.IsNullOrEmpty(filtro.TipoCliente))
                {
                    filtered = filtered.Where(c =>
                        c.TipoCliente?.Contains(filtro.TipoCliente, StringComparison.OrdinalIgnoreCase) == true);
                }

                if (!string.IsNullOrEmpty(filtro.Ubicacion))
                {
                    filtered = filtered.Where(c =>
                        c.Direccion?.Contains(filtro.Ubicacion, StringComparison.OrdinalIgnoreCase) == true);
                }

                if (filtro.Activo.HasValue)
                {
                    filtered = filtered.Where(c => c.Activo == filtro.Activo.Value);
                }

                return filtered.ToList();
            }

            return clientes;
        }

        public async Task<bool> ExisteIdentificador(string identificador, int? excludeId = null)
        {
            using var connection = _repositorioDapper.ObtenerRepositorio();
            const string sp = "dbo.sp_Cliente_ExisteIdentificador";
            var count = await connection.ExecuteScalarAsync<int>(sp,
                new { identificador = identificador ?? string.Empty, excludeId },
                commandType: CommandType.StoredProcedure);
            return count > 0;
        }
    }
}