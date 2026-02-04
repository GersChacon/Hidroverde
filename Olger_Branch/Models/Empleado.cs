using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HidroverdeDigital.Models
{
    [Table("Empleados")]
    public class Empleado
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("empleado_id")]
        public int EmpleadoId { get; set; }

        [Column("rol_id")]
        public int RolId { get; set; }

        [Column("estado_empleado_id")]
        public int EstadoEmpleadoId { get; set; }

        [Required]
        [StringLength(20)]
        [Column("cedula")]
        public string Cedula { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        [Column("nombre")]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        [Column("apellidos")]
        public string Apellidos { get; set; } = string.Empty;

        [StringLength(20)]
        [Column("telefono")]
        public string? Telefono { get; set; }

        [Required]
        [StringLength(100)]
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Column("fecha_nacimiento", TypeName = "date")]
        public DateTime? FechaNacimiento { get; set; }

        [Required]
        [Column("fecha_contratacion", TypeName = "date")]
        public DateTime FechaContratacion { get; set; }

        [StringLength(50)]
        [Column("usuario_sistema")]
        public string? UsuarioSistema { get; set; }

        [StringLength(255)]
        [Column("clave_hash")]
        public string? ClaveHash { get; set; }

        [Required]
        [Column("activo")]
        public bool Activo { get; set; } = true;

        [Required]
        [Column("fecha_creacion", TypeName = "datetime2(0)")]
        public DateTime FechaCreacion { get; set; } = DateTime.Now;
    }
}