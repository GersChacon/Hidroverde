using Autorizacion.Abstracciones.DA;
using Autorizacion.Abstracciones.Flujo;
using Autorizacion.Abstracciones.Modelos;

namespace Autorizacion.Flujo
{
    public class AutorizacionFlujo : IAutorizacionFlujo
    {
        private ISeguridadDA _seguridadDA;

        public AutorizacionFlujo(ISeguridadDA seguridadDA)
        {
            _seguridadDA = seguridadDA;
        }

        public async Task<IEnumerable<Perfil>> ObtenerPerfilesxUsuario(Usuario usuario)
        {
            return await _seguridadDA.ObtenerPerfilesxUsuario(usuario);
        }

        public async Task<Usuario> ObtenerUsuario(Usuario usuario)
        {
            return await _seguridadDA.ObtenerInformacionUsuario(usuario);
        }
    }
}
