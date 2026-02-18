using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace Abstracciones.Interfaces.API
{
    public interface ITipoEntregaController
    {
        Task<IActionResult> Obtener();
        Task<IActionResult> Obtener(int tipoEntregaId);
        Task<IActionResult> Agregar(TipoEntregaRequest tipoEntrega);
        Task<IActionResult> Editar(int tipoEntregaId, TipoEntregaRequest tipoEntrega);
        Task<IActionResult> Eliminar(int tipoEntregaId);
    }
}