using System.ComponentModel.DataAnnotations;

namespace Abstracciones.Modelos
{
    // Equivalente a UsuarioBase / Usuario de la referencia
    // Se usa para registro y obtención de información del empleado
    public class EmpleadoAuthBase
    {
        [Required]
        public string UsuarioSistema { get; set; }
        [Required]
        public string ClaveHash { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }

    public class EmpleadoAuth : EmpleadoAuthBase
    {
        [Required]
        public int EmpleadoId { get; set; }
    }
}
