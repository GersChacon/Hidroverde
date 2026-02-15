using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HidroverdeDigital.Models
{
    [Table("Inventario_Actual")]
    public class InventarioActual
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("inventario_id")]
        public int InventarioId { get; set; }

        [Required]
        [Column("producto_id")]
        public int ProductoId { get; set; }

        [Required]
        [Column("ubicacion_id")]
        public int UbicacionId { get; set; }

        [Required]
        [Column("estado_calidad_id")]
        public int EstadoCalidadId { get; set; }

        [Required]
        [StringLength(100)]
        [Column("lote")]
        public string Lote { get; set; } = string.Empty;

        [Required]
        [Column("cantidad_disponible")]
        public int CantidadDisponible { get; set; }

        [Required]
        [Column("fecha_entrada", TypeName = "date")]
        public DateTime FechaEntrada { get; set; }

        [Required]
        [Column("fecha_caducidad", TypeName = "date")]
        public DateTime FechaCaducidad { get; set; }

        [Column("ciclo_origen_id")]
        public int? CicloOrigenId { get; set; }

        [Column("notas")]
        public string? Notas { get; set; }

        [Required]
        [Column("fecha_creacion", TypeName = "datetime2(0)")]
        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        // Navigation properties
        [ForeignKey("ProductoId")]
        public virtual Producto? Producto { get; set; }
    }
}