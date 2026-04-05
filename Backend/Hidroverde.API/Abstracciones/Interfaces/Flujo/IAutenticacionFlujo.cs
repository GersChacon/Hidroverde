using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.Flujo
{
    // Equivalente a IAutenticacionFlujo de la referencia
    public interface IAutenticacionFlujo
    {
        Task<Token> LoginAsync(LoginBase login);
    }
}
