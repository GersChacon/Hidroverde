using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace Abstracciones.Interfaces.API
{
    public interface IClienteController
    {
        Task<IActionResult> Obtener();
        Task<IActionResult> Obtener(int clienteId);
        Task<IActionResult> Agregar(ClienteRequest cliente);
        Task<IActionResult> Editar(int clienteId, ClienteRequest cliente);
        Task<IActionResult> ObtenerDirecciones(int clienteId);
        Task<IActionResult> AgregarDireccion(int clienteId, DireccionClienteRequest direccion);
        Task<IActionResult> EditarDireccion(int clienteId, int direccionId, DireccionClienteRequest direccion);
        Task<IActionResult> EliminarDireccion(int clienteId, int direccionId);
    }
}