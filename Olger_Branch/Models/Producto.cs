using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HidroverdeDigital.Models
{
    [Table("Productos")]
    public class Producto
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("producto_id")]
        public int ProductoId { get; set; }

        [Required]
        [StringLength(30)]
        [Column("codigo")]
        public string Codigo { get; set; } = string.Empty;

        [Column("variedad_id")]
        public int VariedadId { get; set; }

        [Column("unidad_id")]
        public int UnidadId { get; set; }

        [Required]
        [StringLength(200)]
        [Column("nombre_producto")]
        public string NombreProducto { get; set; } = string.Empty;

        [Column("descripcion")]
        public string? Descripcion { get; set; }

        [Required]
        [Column("precio_base", TypeName = "decimal(10,2)")]
        public decimal PrecioBase { get; set; }

        [Required]
        [Column("dias_caducidad")]
        public int DiasCaducidad { get; set; }

        [Required]
        [Column("requiere_refrigeracion")]
        public bool RequiereRefrigeracion { get; set; }

        [StringLength(500)]
        [Column("imagen_url")]
        public string? ImagenUrl { get; set; }

        [Required]
        [Column("activo")]
        public bool Activo { get; set; } = true;

        [Required]
        [Column("fecha_creacion", TypeName = "datetime2(0)")]
        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        [Column("stock_minimo")]
        public int? StockMinimo { get; set; }
    }
}