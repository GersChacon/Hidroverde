using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace Abstracciones.Interfaces.API
{
    public interface ICategoriaController
    {
        Task<IActionResult> Obtener();
        Task<IActionResult> Obtener(int categoriaId);
        Task<IActionResult> Agregar(CategoriaRequest categoria);
        Task<IActionResult> Editar(int categoriaId, CategoriaRequest categoria);
        Task<IActionResult> Eliminar(int categoriaId);
    }
}