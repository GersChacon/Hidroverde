using Abstracciones.Interfaces.Flujo;
using Abstracciones.Interfaces.Reglas;
using Abstracciones.Modelos;

namespace Flujo
{
    // Equivalente a AutenticacionFlujo de la referencia
    public class AutenticacionFlujo : IAutenticacionFlujo
    {
        private readonly IAutenticacionBC _autenticacionBC;

        public AutenticacionFlujo(IAutenticacionBC autenticacionBC)
        {
            _autenticacionBC = autenticacionBC;
        }

        public async Task<Token> LoginAsync(LoginBase login)
            => await _autenticacionBC.LoginAsync(login);
    }
}
