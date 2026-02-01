using System;

namespace Abstracciones.Modelos
{
    public class TipoCultivoBase
    {
        public string Codigo { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public string Requisitos { get; set; }
        public bool Activo { get; set; }
    }

    public class TipoCultivoRequest : TipoCultivoBase
    {
    }

    public class TipoCultivoResponse : TipoCultivoBase
    {
        public int TipoCultivoId { get; set; }
    }
}