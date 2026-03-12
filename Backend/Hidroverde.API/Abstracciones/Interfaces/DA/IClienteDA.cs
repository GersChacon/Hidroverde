using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Abstracciones.Modelos.Cliente;

namespace Abstracciones.Interfaces.DA
{
    public interface IClienteDA
    {
        Task<int> Agregar(ClienteRequest request);
        Task<int> Editar(int clienteId, ClienteRequest request);
        Task<int> Eliminar(int clienteId);
        Task<ClienteResponse?> ObtenerPorId(int clienteId);
        Task<IEnumerable<ClienteResponse>> ObtenerTodos(ClienteFilter? filtro = null);
        Task<bool> ExisteIdentificador(string identificador, int? excludeId = null);
    }
}