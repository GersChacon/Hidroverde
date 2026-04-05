using System.ComponentModel.DataAnnotations;

namespace Abstracciones.Modelos
{
    // Equivalente a LoginBase de la referencia
    // UsuarioSistema → NombreUsuario
    // ClaveHash      → PasswordHash
    // Email          → CorreoElectronico (agregado para paridad con la referencia)
    public class LoginBase
    {
        [Required]
        public string UsuarioSistema { get; set; }
        [Required]
        public string ClaveHash { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }

    public class Login : LoginBase
    {
        [Required]
        public int EmpleadoId { get; set; }
    }
}
