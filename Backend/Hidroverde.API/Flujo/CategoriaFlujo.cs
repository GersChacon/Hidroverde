using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;

namespace Flujo
{
    public class CategoriaFlujo : ICategoriaFlujo
    {
        private readonly ICategoriaDA _categoriaDA;

        public CategoriaFlujo(ICategoriaDA categoriaDA)
        {
            _categoriaDA = categoriaDA;
        }

        public Task<int> Agregar(CategoriaRequest categoria)
        {
            return _categoriaDA.Agregar(categoria);
        }

        public Task<int> Editar(int categoriaId, CategoriaRequest categoria)
        {
            return _categoriaDA.Editar(categoriaId, categoria);
        }

        public Task<int> Eliminar(int categoriaId)
        {
            return _categoriaDA.Eliminar(categoriaId);
        }

        public Task<IEnumerable<CategoriaResponse>> Obtener()
        {
            return _categoriaDA.Obtener();
        }

        public Task<CategoriaResponse> Obtener(int categoriaId)
        {
            return _categoriaDA.Obtener(categoriaId);
        }
    }
}