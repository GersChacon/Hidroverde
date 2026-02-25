namespace Abstracciones.Modelos
{
    public class EmpleadoBase
    {
        public int RolId { get; set; }
        public string Cedula { get; set; }
        public string Nombre { get; set; }
        public string Apellidos { get; set; }
        public string? Telefono { get; set; }
        public string Email { get; set; }
        public DateTime? FechaNacimiento { get; set; }
        public DateTime FechaContratacion { get; set; }
        public string? UsuarioSistema { get; set; }
        public bool Activo { get; set; }
        public string Estado { get; set; } // ACTIVO, INACTIVO, VACACIONES, LICENCIA
    }

    public class EmpleadoRequest : EmpleadoBase
    {
        public string? ClaveHash { get; set; }
    }

    public class EmpleadoResponse : EmpleadoBase
    {
        public int EmpleadoId { get; set; }
        public DateTime FechaCreacion { get; set; }
        public string NombreRol { get; set; }
    }

    public class EmpleadoEstadoRequest
    {
        public string Estado { get; set; } // ACTIVO, INACTIVO, VACACIONES, LICENCIA
    }
}