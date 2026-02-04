// DailyProcessCompletion.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HidroverdeDigital.Models
{
    [Table("DailyProcessCompletions")]
    public class DailyProcessCompletion
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CompletionId { get; set; }

        [Required]
        [Display(Name = "ID del Proceso")]
        public int ProcessId { get; set; }

        [Required]
        [Display(Name = "ID del Empleado")]
        public int EmpleadoId { get; set; }

        [Required]
        [DataType(DataType.Date)]
        [Display(Name = "Fecha de Completación")]
        public DateTime CompletionDate { get; set; }

        [Required]
        [DataType(DataType.DateTime)]
        [Display(Name = "Hora de Completación")]
        public DateTime CompletionTime { get; set; } = DateTime.Now;

        [Display(Name = "Observaciones")]
        [DataType(DataType.MultilineText)]
        public string? Observations { get; set; }

        [Required]
        [StringLength(20)]
        [Display(Name = "Estado")]
        public string Status { get; set; } = "PENDING";

        // Navigation properties
        [ForeignKey("ProcessId")]
        public virtual DailyProcess? DailyProcess { get; set; }

        [ForeignKey("EmpleadoId")]
        public virtual Empleado? Empleado { get; set; }
    }
}