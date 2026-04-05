using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Reglas;
using Abstracciones.Modelos;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Reglas
{
    public class AutenticacionReglas : IAutenticacionBC
    {
        private readonly IConfiguration _configuration;
        private readonly IEmpleadoAuthDA _empleadoAuthDA;
        private EmpleadoAuth _empleado;

        public AutenticacionReglas(IConfiguration configuration, IEmpleadoAuthDA empleadoAuthDA)
        {
            _configuration = configuration;
            _empleadoAuthDA = empleadoAuthDA;
        }

        public async Task<Token> LoginAsync(LoginBase login)
        {
            Token respuestaToken = new Token() { AccessToken = string.Empty, ValidacionExitosa = false };

            _empleado = await _empleadoAuthDA.ObtenerEmpleadoAuth(
                new EmpleadoAuthBase { UsuarioSistema = login.UsuarioSistema, Email = login.Email });

            if (_empleado == null)
                return respuestaToken;

            if (!await VerificarHashContraseniaAsync(login))
                return respuestaToken;

            TokenConfiguracion tokenConfiguracion = _configuration.GetSection("Token").Get<TokenConfiguracion>();
            JwtSecurityToken token = await GenerarTokenJWT(tokenConfiguracion);

            respuestaToken.AccessToken = new JwtSecurityTokenHandler().WriteToken(token);
            respuestaToken.ValidacionExitosa = true;
            return respuestaToken;
        }

        private async Task<bool> VerificarHashContraseniaAsync(LoginBase login)
            => login != null && login.ClaveHash == _empleado.ClaveHash;

        private async Task<JwtSecurityToken> GenerarTokenJWT(TokenConfiguracion tokenConfiguracion)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenConfiguracion.key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            List<Claim> claims = await GenerarClaims();
            return new JwtSecurityToken(
                tokenConfiguracion.Issuer,
                tokenConfiguracion.Audience,
                claims,
                expires: DateTime.Now.AddMinutes(tokenConfiguracion.Expires),
                signingCredentials: credentials);
        }

        private async Task<List<Claim>> GenerarClaims()
        {
            return new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, _empleado.EmpleadoId.ToString()),
                new Claim(ClaimTypes.Name,            _empleado.UsuarioSistema),
                new Claim(ClaimTypes.Email,           _empleado.Email)
            };
        }
    }
}
