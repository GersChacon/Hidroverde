using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

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

        public async Task<IEnumerable<ClienteResponse>> Obtener() =>
            await _sqlConnection.QueryAsync<ClienteResponse>("ObtenerClientes", commandType: CommandType.StoredProcedure);

        public async Task<ClienteResponse> Obtener(int clienteId) =>
            await _sqlConnection.QueryFirstOrDefaultAsync<ClienteResponse>(
                "ObtenerCliente", new { cliente_id = clienteId }, commandType: CommandType.StoredProcedure);

        public async Task<int> Agregar(ClienteRequest cliente) =>
            await _sqlConnection.ExecuteScalarAsync<int>("AgregarCliente",
                new { tipo_cliente_id = cliente.TipoClienteId, cedula_ruc = cliente.CedulaRuc, nombre = cliente.Nombre, apellidos = cliente.Apellidos, telefono = cliente.Telefono, email = cliente.Email, notas = cliente.Notas, activo = cliente.Activo },
                commandType: CommandType.StoredProcedure);

        public async Task<int> Editar(int clienteId, ClienteRequest cliente)
        {
            await VerificarExiste(clienteId);
            return await _sqlConnection.ExecuteScalarAsync<int>("EditarCliente",
                new { cliente_id = clienteId, tipo_cliente_id = cliente.TipoClienteId, cedula_ruc = cliente.CedulaRuc, nombre = cliente.Nombre, apellidos = cliente.Apellidos, telefono = cliente.Telefono, email = cliente.Email, notas = cliente.Notas, activo = cliente.Activo },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<DireccionClienteResponse>> ObtenerDirecciones(int clienteId) =>
            await _sqlConnection.QueryAsync<DireccionClienteResponse>(
                "ObtenerDireccionesCliente", new { cliente_id = clienteId }, commandType: CommandType.StoredProcedure);

        public async Task<int> AgregarDireccion(DireccionClienteRequest direccion) =>
            await _sqlConnection.ExecuteScalarAsync<int>("AgregarDireccionCliente",
                new { cliente_id = direccion.ClienteId, alias = direccion.Alias, direccion_exacta = direccion.DireccionExacta, referencia = direccion.Referencia, telefono_contacto = direccion.TelefonoContacto, activa = direccion.Activa, codigo_postal = direccion.CodigoPostal },
                commandType: CommandType.StoredProcedure);

        public async Task<int> EditarDireccion(int direccionId, DireccionClienteRequest direccion) =>
            await _sqlConnection.ExecuteScalarAsync<int>("EditarDireccionCliente",
                new { direccion_id = direccionId, cliente_id = direccion.ClienteId, alias = direccion.Alias, direccion_exacta = direccion.DireccionExacta, referencia = direccion.Referencia, telefono_contacto = direccion.TelefonoContacto, activa = direccion.Activa, codigo_postal = direccion.CodigoPostal },
                commandType: CommandType.StoredProcedure);

        public async Task<int> EliminarDireccion(int direccionId) =>
            await _sqlConnection.ExecuteScalarAsync<int>("EliminarDireccionCliente",
                new { direccion_id = direccionId }, commandType: CommandType.StoredProcedure);

        private async Task VerificarExiste(int clienteId)
        {
            if (await Obtener(clienteId) == null)
                throw new KeyNotFoundException($"No se encontró el cliente con ID {clienteId}");
        }
    }
}