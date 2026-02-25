using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.Flujo
{
    public interface IClienteFlujo
    {
        Task<IEnumerable<ClienteResponse>> Obtener();
        Task<ClienteResponse> Obtener(int clienteId);
        Task<int> Agregar(ClienteRequest cliente);
        Task<int> Editar(int clienteId, ClienteRequest cliente);
        Task<IEnumerable<DireccionClienteResponse>> ObtenerDirecciones(int clienteId);
        Task<int> AgregarDireccion(DireccionClienteRequest direccion);
        Task<int> EditarDireccion(int direccionId, DireccionClienteRequest direccion);
        Task<int> EliminarDireccion(int direccionId);
    }
}