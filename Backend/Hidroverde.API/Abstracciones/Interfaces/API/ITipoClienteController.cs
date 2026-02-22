using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace Abstracciones.Interfaces.API
{
    public interface ITipoClienteController
    {
        Task<IActionResult> Obtener();
        Task<IActionResult> Obtener(int tipoClienteId);
        Task<IActionResult> Agregar(TipoClienteRequest tipoCliente);
        Task<IActionResult> Editar(int tipoClienteId, TipoClienteRequest tipoCliente);
        Task<IActionResult> Eliminar(int tipoClienteId);
    }
}