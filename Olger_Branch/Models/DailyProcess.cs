// DailyProcess.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HidroverdeDigital.Models
{
    [Table("DailyProcesses")]
    public class DailyProcess
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ProcessId { get; set; }

        [Required(ErrorMessage = "El número de paso es requerido")]
        [Display(Name = "Número de Paso")]
        public int StepNumber { get; set; }

        [Required(ErrorMessage = "La categoría es requerida")]
        [StringLength(50)]
        [Display(Name = "Categoría")]
        public string Category { get; set; } = "Operation";

        [Required(ErrorMessage = "El título del proceso es requerido")]
        [StringLength(200, ErrorMessage = "El título no puede exceder 200 caracteres")]
        [Display(Name = "Título del Proceso")]
        public string ProcessTitle { get; set; } = string.Empty;

        [Required(ErrorMessage = "La descripción es requerida")]
        [DataType(DataType.MultilineText)]
        [Display(Name = "Descripción")]
        public string Description { get; set; } = string.Empty;

        [Display(Name = "Minutos Estimados")]
        [Range(0, 480, ErrorMessage = "Los minutos deben estar entre 0 y 480")]
        public int? EstimatedMinutes { get; set; }

        [Display(Name = "Requiere Confirmación")]
        public bool RequiresConfirmation { get; set; } = true;

        [Display(Name = "Activo")]
        public bool IsActive { get; set; } = true;

        [Display(Name = "Fecha de Creación")]
        [DataType(DataType.DateTime)]
        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        [Display(Name = "Fecha de Modificación")]
        [DataType(DataType.DateTime)]
        public DateTime? FechaModificacion { get; set; }

        // Navigation property
        public virtual ICollection<DailyProcessCompletion>? Completions { get; set; }
    }
}