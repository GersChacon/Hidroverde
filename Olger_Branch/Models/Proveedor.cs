using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HidroverdeDigital.Models
{
    [Table("Proveedores")]
    public class Proveedor
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("proveedor_id")]
        public int ProveedorId { get; set; }

        [Required]
        [StringLength(30)]
        [Column("codigo")]
        public string Codigo { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        [Column("nombre")]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        [Column("tipo_proveedor")]
        public string TipoProveedor { get; set; } = string.Empty;

        [StringLength(20)]
        [Column("telefono")]
        public string? Telefono { get; set; }

        [StringLength(100)]
        [Column("email")]
        [EmailAddress]
        public string? Email { get; set; }

        [Column("direccion")]
        public string? Direccion { get; set; }

        [Required]
        [StringLength(200)]
        [Column("tipo_suministro")]
        public string TipoSuministro { get; set; } = string.Empty;

        [Column("productos_provee")]
        public string? ProductosProvee { get; set; }

        [StringLength(100)]
        [Column("contacto_principal")]
        public string? ContactoPrincipal { get; set; }

        [Column("notas")]
        public string? Notas { get; set; }

        [Required]
        [Column("activo")]
        public bool Activo { get; set; } = true;

        [Required]
        [Column("fecha_registro", TypeName = "datetime2(0)")]
        public DateTime FechaRegistro { get; set; } = DateTime.Now;

        [Column("fecha_ultima_compra", TypeName = "date")]
        public DateTime? FechaUltimaCompra { get; set; }
    }
}