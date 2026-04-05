using Autorizacion.Abstracciones.Flujo;
using Autorizacion.Abstracciones.Modelos;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace Autorizacion.Middleware
{
    public class ClaimsRoles
    {
        private readonly RequestDelegate _next;

        public ClaimsRoles(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext httpContext, IAutorizacionFlujo autorizacionFlujo)
        {
            var appIdentity = await VerificarAutorizacion(httpContext, autorizacionFlujo);
            httpContext.User.AddIdentity(appIdentity);
            await _next(httpContext);
        }

        private async Task<ClaimsIdentity> VerificarAutorizacion(HttpContext httpContext, IAutorizacionFlujo autorizacionFlujo)
        {
            var claims = new List<Claim>();
            if (httpContext.User != null && httpContext.User.Identity!.IsAuthenticated)
            {
                await AgregarClaimsRoles(httpContext, autorizacionFlujo, claims);
            }
            return new ClaimsIdentity(claims);
        }

        private async Task AgregarClaimsRoles(HttpContext httpContext, IAutorizacionFlujo autorizacionFlujo, List<Claim> claims)
        {
            var roles = await ObtenerRoles(httpContext, autorizacionFlujo);
            if (roles != null && roles.Any())
            {
                foreach (var rol in roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, rol.RolId.ToString()));
                }
            }
        }

        private async Task<IEnumerable<Rol>> ObtenerRoles(HttpContext httpContext, IAutorizacionFlujo autorizacionFlujo)
        {
            var usuarioSistema = httpContext.User.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;

            return await autorizacionFlujo.ObtenerRolesxEmpleado(
                new Empleado { UsuarioSistema = usuarioSistema });
        }
    }

    public static class ClaimsRolesMiddlewareExtensions
    {
        public static IApplicationBuilder AutorizacionClaims(this IApplicationBuilder builder)
            => builder.UseMiddleware<ClaimsRoles>();
    }
}
