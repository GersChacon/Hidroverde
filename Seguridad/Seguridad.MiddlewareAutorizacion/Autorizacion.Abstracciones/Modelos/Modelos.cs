namespace Autorizacion.Abstracciones.Modelos
{
    public class Empleado
    {
        public int EmpleadoId { get; set; }
        public string? UsuarioSistema { get; set; }
        public string? ClaveHash { get; set; }
        public string? Email { get; set; }
    }

    public class Rol
    {
        public int RolId { get; set; }
        public string Codigo { get; set; }
        public string Nombre { get; set; }
        public int? NivelAcceso { get; set; }
    }
}
