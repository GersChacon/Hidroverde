using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;

namespace Flujo
{
    public class ClienteFlujo : IClienteFlujo
    {
        private readonly IClienteDA _clienteDA;
        public ClienteFlujo(IClienteDA clienteDA) => _clienteDA = clienteDA;

        public Task<int> Agregar(ClienteRequest cliente) => _clienteDA.Agregar(cliente);
        public Task<int> Editar(int clienteId, ClienteRequest cliente) => _clienteDA.Editar(clienteId, cliente);
        public Task<IEnumerable<ClienteResponse>> Obtener() => _clienteDA.Obtener();
        public Task<ClienteResponse> Obtener(int clienteId) => _clienteDA.Obtener(clienteId);
        public Task<IEnumerable<DireccionClienteResponse>> ObtenerDirecciones(int clienteId) => _clienteDA.ObtenerDirecciones(clienteId);
        public Task<int> AgregarDireccion(DireccionClienteRequest direccion) => _clienteDA.AgregarDireccion(direccion);
        public Task<int> EditarDireccion(int direccionId, DireccionClienteRequest direccion) => _clienteDA.EditarDireccion(direccionId, direccion);
        public Task<int> EliminarDireccion(int direccionId) => _clienteDA.EliminarDireccion(direccionId);
    }
}