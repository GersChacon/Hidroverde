using System.ComponentModel.DataAnnotations;

namespace Abstracciones.Modelos
{
    public class LoginBase
    {
        [Required]
        public string UsuarioSistema { get; set; }
        [Required]
        public string ClaveHash { get; set; }
        public string? Email { get; set; }
    }

    public class Login : LoginBase
    {
        [Required]
        public int EmpleadoId { get; set; }
    }
}
