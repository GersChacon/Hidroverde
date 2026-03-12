using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos.Cliente;

namespace Flujo
{
    public class ClienteFlujo : IClienteFlujo
    {
        private readonly IClienteDA _clienteDA;

        public ClienteFlujo(IClienteDA clienteDA)
        {
            _clienteDA = clienteDA;
        }

        public async Task<int> Agregar(ClienteRequest request)
        {
            // Validar campos obligatorios
            if (string.IsNullOrWhiteSpace(request.NombreRazonSocial))
                throw new Exception("El nombre o razón social es obligatorio.");
            if (string.IsNullOrWhiteSpace(request.Email))
                throw new Exception("El email es obligatorio.");
            if (string.IsNullOrWhiteSpace(request.IdentificadorUnico))
                throw new Exception("El identificador único (cédula/RUC) es obligatorio.");

            // Validar duplicado
            var existe = await _clienteDA.ExisteIdentificador(request.IdentificadorUnico);
            if (existe)
                throw new Exception("Ya existe un cliente con ese identificador.");

            return await _clienteDA.Agregar(request);
        }

        public async Task<int> Editar(int clienteId, ClienteRequest request)
        {
            // Validar existencia
            var existente = await _clienteDA.ObtenerPorId(clienteId);
            if (existente == null)
                throw new Exception("Cliente no encontrado.");

            // Validar duplicado (si cambió el identificador)
            if (!string.Equals(existente.IdentificadorUnico, request.IdentificadorUnico, StringComparison.OrdinalIgnoreCase))
            {
                var existe = await _clienteDA.ExisteIdentificador(request.IdentificadorUnico, clienteId);
                if (existe)
                    throw new Exception("Ya existe otro cliente con ese identificador.");
            }

            return await _clienteDA.Editar(clienteId, request);
        }

        public async Task<int> Eliminar(int clienteId) => await _clienteDA.Eliminar(clienteId);

        public async Task<ClienteResponse?> ObtenerPorId(int clienteId) => await _clienteDA.ObtenerPorId(clienteId);

        public async Task<IEnumerable<ClienteResponse>> ObtenerTodos(ClienteFilter? filtro = null)
            => await _clienteDA.ObtenerTodos(filtro);
    }
}