// ApplicationDbContext.cs
using HidroverdeDigital.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace HidroverdeDigital.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Existing DbSets (make sure these models exist)
        public DbSet<Producto> Productos { get; set; }
        public DbSet<Proveedor> Proveedores { get; set; }
        public DbSet<Empleado> Empleados { get; set; }
        public DbSet<InventarioActual> InventarioActual { get; set; }

        // NEW: Daily Manual DbSets
        public DbSet<DailyProcess> DailyProcesses { get; set; }
        public DbSet<DailyProcessCompletion> DailyProcessCompletions { get; set; }
        public DbSet<Alerta> Alerta { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure DailyProcess table
            modelBuilder.Entity<DailyProcess>(entity =>
            {
                entity.HasKey(e => e.ProcessId);
                entity.Property(e => e.ProcessTitle).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Category).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).IsRequired();
                entity.Property(e => e.FechaCreacion).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.RequiresConfirmation).HasDefaultValue(true);

                // Indexes
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.StepNumber);
                entity.HasIndex(e => e.IsActive);
            });

            // Configure DailyProcessCompletion table
            modelBuilder.Entity<DailyProcessCompletion>(entity =>
            {
                entity.HasKey(e => e.CompletionId);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
                entity.Property(e => e.CompletionTime).HasDefaultValueSql("GETDATE()");

                // Foreign Keys
                entity.HasOne(e => e.DailyProcess)
                    .WithMany()
                    .HasForeignKey(e => e.ProcessId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Empleado)
                    .WithMany()
                    .HasForeignKey(e => e.EmpleadoId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Check constraint for Status
                entity.HasCheckConstraint("CK_DailyProcessCompletions_Status",
                    "[Status] IN ('PENDING', 'COMPLETED', 'SKIPPED')");

                // Indexes
                entity.HasIndex(e => new { e.ProcessId, e.EmpleadoId, e.CompletionDate });
                entity.HasIndex(e => e.CompletionDate);
                entity.HasIndex(e => e.Status);
            });
        }
    }
}