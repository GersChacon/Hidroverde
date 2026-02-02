using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace Abstracciones.Interfaces.API
{
    public interface IProductoController
    {
        Task<IActionResult> Obtener();
        Task<IActionResult> Obtener(int productoId);
        Task<IActionResult> Agregar(ProductoRequest producto);
        Task<IActionResult> Editar(int productoId, ProductoRequest producto);
        Task<IActionResult> Eliminar(int productoId);
    }
}