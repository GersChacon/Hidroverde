using Autorizacion.Abstracciones.Modelos;

namespace Autorizacion.Abstracciones.Flujo
{
    public interface IAutorizacionFlujo
    {
        Task<Usuario> ObtenerUsuario(Usuario usuario);
        Task<IEnumerable<Perfil>> ObtenerPerfilesxUsuario(Usuario usuario);
    }
}
