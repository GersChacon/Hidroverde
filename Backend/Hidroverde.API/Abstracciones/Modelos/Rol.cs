namespace Abstracciones.Modelos
{
    public class RolBase
    {
        public string Codigo { get; set; }
        public string Nombre { get; set; }
        public int? NivelAcceso { get; set; }
        public string? Descripcion { get; set; }
        public bool Activo { get; set; }
    }

    public class RolRequest : RolBase { }

    public class RolResponse : RolBase
    {
        public int RolId { get; set; }
    }
}