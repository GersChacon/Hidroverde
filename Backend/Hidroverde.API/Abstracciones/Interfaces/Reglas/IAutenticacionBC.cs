using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.Reglas
{
    public interface IAutenticacionBC
    {
        Task<Token> LoginAsync(LoginBase login);
    }
}
