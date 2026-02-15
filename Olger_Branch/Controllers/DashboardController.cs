// DashboardController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HidroverdeDigital.Data;
using HidroverdeDigital.Models;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace HidroverdeDigital.Controllers
{
    public class DashboardController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly Random _random = new Random();

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: /Dashboard
        public async Task<IActionResult> Index()
        {
            try
            {
                // Get current employee
                var empleadoId = GetCurrentEmployeeId();
                var today = DateTime.Today;

                // Dashboard ViewModel
                var viewModel = new DashboardViewModel
                {
                    // Daily Manual Progress
                    DailyManualProgress = await GetDailyManualProgress(today, empleadoId),

                    // Product Management Stats
                    ProductStats = await GetProductStats(),

                    // Supplier Stats
                    SupplierStats = await GetSupplierStats(),

                    // Inventory Stats
                    InventoryStats = await GetInventoryStats(),

                    // Alert Stats
                    AlertStats = await GetAlertStats(),

                    // Recent Activities
                    RecentActivities = await GetRecentActivities(),

                    // Sales Data
                    SalesData = await GetSalesData(),

                    // Planting Plan vs Actual
                    ProductionData = await GetProductionData()
                };

                return View(viewModel);
            }
            catch (Exception ex)
            {
                ViewBag.Error = "Error loading dashboard: " + ex.Message;
                return View(new DashboardViewModel());
            }
        }

        private async Task<DailyManualProgress> GetDailyManualProgress(DateTime today, int? empleadoId)
        {
            var totalProcesses = await _context.DailyProcesses
                .Where(p => p.IsActive)
                .CountAsync();

            var completedToday = await _context.DailyProcessCompletions
                .Where(c => c.CompletionDate == today &&
                           c.Status == "COMPLETED" &&
                           (empleadoId == null || c.EmpleadoId == empleadoId))
                .CountAsync();

            return new DailyManualProgress
            {
                TotalSteps = totalProcesses,
                CompletedToday = completedToday,
                CompletionRate = totalProcesses > 0 ? (completedToday * 100 / totalProcesses) : 0,
                EstimatedMinutes = await _context.DailyProcesses
                    .Where(p => p.IsActive)
                    .SumAsync(p => p.EstimatedMinutes ?? 0)
            };
        }

        private async Task<ProductStats> GetProductStats()
        {
            var totalProducts = await _context.Productos.CountAsync();
            var activeProducts = await _context.Productos.CountAsync(p => p.Activo);

            // Get products with low stock (dummy data for demonstration)
            var lowStockProducts = new List<LowStockProduct>
            {
                new LowStockProduct { ProductName = "Lechuga Romana", CurrentStock = 12, MinStock = 50 },
                new LowStockProduct { ProductName = "Tomate Cherry", CurrentStock = 8, MinStock = 30 },
                new LowStockProduct { ProductName = "Albahaca Fresca", CurrentStock = 5, MinStock = 40 }
            };

            return new ProductStats
            {
                TotalProducts = totalProducts,
                ActiveProducts = activeProducts,
                LowStockProducts = lowStockProducts,
                ProductsNeedingRestock = lowStockProducts.Count
            };
        }

        private async Task<SupplierStats> GetSupplierStats()
        {
            var totalSuppliers = await _context.Proveedores.CountAsync();
            var activeSuppliers = await _context.Proveedores.CountAsync(p => p.Activo);

            var recentSuppliers = await _context.Proveedores
                .Where(p => p.Activo)
                .OrderByDescending(p => p.FechaRegistro)
                .Take(5)
                .Select(p => new SupplierInfo
                {
                    Name = p.Nombre,
                    Contact = p.Telefono ?? p.Email ?? "No contact",
                    LastPurchase = p.FechaUltimaCompra
                })
                .ToListAsync();

            return new SupplierStats
            {
                TotalSuppliers = totalSuppliers,
                ActiveSuppliers = activeSuppliers,
                RecentSuppliers = recentSuppliers
            };
        }

        private async Task<InventoryStats> GetInventoryStats()
        {
            // Dummy inventory movements for demonstration
            var recentMovements = new List<InventoryMovement>
            {
                new InventoryMovement { Type = "Entrada", Product = "Lechuga Romana", Quantity = 100, Date = DateTime.Now.AddDays(-1) },
                new InventoryMovement { Type = "Salida", Product = "Tomate Cherry", Quantity = 50, Date = DateTime.Now.AddDays(-2) },
                new InventoryMovement { Type = "Entrada", Product = "Albahaca Fresca", Quantity = 80, Date = DateTime.Now.AddDays(-3) },
                new InventoryMovement { Type = "Salida", Product = "Lechuga Romana", Quantity = 30, Date = DateTime.Now.AddHours(-12) }
            };

            return new InventoryStats
            {
                RecentMovements = recentMovements,
                TotalMovementsThisWeek = 15,
                PendingApprovals = 3
            };
        }

        private async Task<AlertStats> GetAlertStats()
        {
            // Get active alerts from database
            var activeAlerts = await _context.Alerta
                .Where(a => a.Estado == "ACTIVA")
                .Select(a => new AlertInfo
                {
                    Id = a.AlertaId,
                    Type = a.TipoAlerta,
                    Message = a.Mensaje,
                    ProductName = a.Producto.NombreProducto,
                    CreatedDate = a.FechaCreacion
                })
                .ToListAsync();

            return new AlertStats
            {
                ActiveAlerts = activeAlerts.Count,
                AlertList = activeAlerts,
                UnacknowledgedAlerts = activeAlerts.Count(a => a.AcknowledgedDate == null)
            };
        }

        private async Task<List<RecentActivity>> GetRecentActivities()
        {
            // Combine recent activities from different sources
            var activities = new List<RecentActivity>();

            // Daily manual completions
            var todayCompletions = await _context.DailyProcessCompletions
                .Include(c => c.DailyProcess)
                .Include(c => c.Empleado)
                .Where(c => c.CompletionDate == DateTime.Today && c.Status == "COMPLETED")
                .OrderByDescending(c => c.CompletionTime)
                .Take(5)
                .Select(c => new RecentActivity
                {
                    Type = "Daily Manual",
                    Description = $"{c.Empleado.Nombre} completó: {c.DailyProcess.ProcessTitle}",
                    Timestamp = c.CompletionTime,
                    User = c.Empleado.Nombre,
                    Icon = "fa-check-circle"
                })
                .ToListAsync();

            activities.AddRange(todayCompletions);

            // Add dummy sales activities
            activities.Add(new RecentActivity
            {
                Type = "Venta",
                Description = "Nueva venta registrada: 50 unidades de Lechuga Romana",
                Timestamp = DateTime.Now.AddHours(-2),
                User = "Juan Pérez",
                Icon = "fa-shopping-cart"
            });

            activities.Add(new RecentActivity
            {
                Type = "Inventario",
                Description = "Nueva entrada de inventario: 100 unidades de Tomate Cherry",
                Timestamp = DateTime.Now.AddHours(-4),
                User = "María González",
                Icon = "fa-boxes"
            });

            activities.Add(new RecentActivity
            {
                Type = "Cultivo",
                Description = "Nuevo ciclo de cultivo iniciado: Torre A-3",
                Timestamp = DateTime.Now.AddDays(-1),
                User = "Carlos Rodríguez",
                Icon = "fa-seedling"
            });

            return activities.OrderByDescending(a => a.Timestamp).Take(10).ToList();
        }

        private async Task<SalesData> GetSalesData()
        {
            // Dummy sales data for charts
            var monthlySales = new List<MonthlySale>
            {
                new MonthlySale { Month = "Ene", Amount = 4500000 },
                new MonthlySale { Month = "Feb", Amount = 5200000 },
                new MonthlySale { Month = "Mar", Amount = 4800000 },
                new MonthlySale { Month = "Abr", Amount = 6100000 },
                new MonthlySale { Month = "May", Amount = 5500000 },
                new MonthlySale { Month = "Jun", Amount = 5900000 }
            };

            var topProducts = new List<ProductSale>
            {
                new ProductSale { ProductName = "Lechuga Romana", Sales = 1250000, Units = 450 },
                new ProductSale { ProductName = "Tomate Cherry", Sales = 980000, Units = 320 },
                new ProductSale { ProductName = "Albahaca Fresca", Sales = 750000, Units = 280 },
                new ProductSale { ProductName = "Espinaca Hidro", Sales = 620000, Units = 210 },
                new ProductSale { ProductName = "Cilantro Fresco", Sales = 540000, Units = 190 }
            };

            return new SalesData
            {
                MonthlySales = monthlySales,
                TopProducts = topProducts,
                TotalThisMonth = 5900000,
                GrowthRate = 12.5m
            };
        }

        private async Task<ProductionData> GetProductionData()
        {
            return new ProductionData
            {
                PlannedProduction = 1500,
                ActualProduction = 1420,
                EfficiencyRate = 94.7m,
                UpcomingHarvests = 5,
                ActiveCultivationCycles = 12
            };
        }

        // AJAX endpoint for accepting alerts
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AcceptAlert(int alertId)
        {
            try
            {
                var empleadoId = GetCurrentEmployeeId();
                if (empleadoId == null)
                    return Json(new { success = false, message = "Usuario no autenticado" });

                var alert = await _context.Alerta.FindAsync(alertId);
                if (alert == null)
                    return Json(new { success = false, message = "Alerta no encontrada" });

                alert.Estado = "ACEPTADA";
                alert.FechaAceptada = DateTime.Now;
                alert.UsuarioAceptaId = empleadoId;

                await _context.SaveChangesAsync();
                return Json(new { success = true, message = "Alerta aceptada" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error: " + ex.Message });
            }
        }

        // AJAX endpoint for dismissing alerts
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DismissAlert(int alertId)
        {
            try
            {
                var alert = await _context.Alerta.FindAsync(alertId);
                if (alert == null)
                    return Json(new { success = false, message = "Alerta no encontrada" });

                alert.Estado = "ACEPTADA"; // Or create a dismissed state
                alert.FechaAceptada = DateTime.Now;

                await _context.SaveChangesAsync();
                return Json(new { success = true, message = "Alerta descartada" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error: " + ex.Message });
            }
        }

        // AJAX endpoint for quick stats
        [HttpGet]
        public async Task<IActionResult> GetQuickStats()
        {
            try
            {
                var stats = new
                {
                    TotalProducts = await _context.Productos.CountAsync(),
                    TotalSuppliers = await _context.Proveedores.CountAsync(),
                    ActiveAlerts = await _context.Alerta.CountAsync(a => a.Estado == "ACTIVA"),
                    PendingApprovals = 3, // Dummy data
                    TodaysCompletions = await _context.DailyProcessCompletions
                        .CountAsync(c => c.CompletionDate == DateTime.Today && c.Status == "COMPLETED")
                };

                return Json(stats);
            }
            catch (Exception ex)
            {
                return Json(new { error = ex.Message });
            }
        }

        private int? GetCurrentEmployeeId()
        {
            // Implementation as before
            var empleadoIdString = HttpContext.Session.GetString("EmpleadoId");
            if (int.TryParse(empleadoIdString, out int id))
            {
                return id;
            }
            return 1; // Default for demo
        }
    }

    // View Models
    public class DashboardViewModel
    {
        public DailyManualProgress DailyManualProgress { get; set; }
        public ProductStats ProductStats { get; set; }
        public SupplierStats SupplierStats { get; set; }
        public InventoryStats InventoryStats { get; set; }
        public AlertStats AlertStats { get; set; }
        public List<RecentActivity> RecentActivities { get; set; }
        public SalesData SalesData { get; set; }
        public ProductionData ProductionData { get; set; }
    }

    public class DailyManualProgress
    {
        public int TotalSteps { get; set; }
        public int CompletedToday { get; set; }
        public int CompletionRate { get; set; }
        public int? EstimatedMinutes { get; set; }
    }

    public class ProductStats
    {
        public int TotalProducts { get; set; }
        public int ActiveProducts { get; set; }
        public int ProductsNeedingRestock { get; set; }
        public List<LowStockProduct> LowStockProducts { get; set; }
    }

    public class LowStockProduct
    {
        public string ProductName { get; set; }
        public int CurrentStock { get; set; }
        public int MinStock { get; set; }
        public bool IsCritical => CurrentStock < (MinStock * 0.3);
    }

    public class SupplierStats
    {
        public int TotalSuppliers { get; set; }
        public int ActiveSuppliers { get; set; }
        public List<SupplierInfo> RecentSuppliers { get; set; }
    }

    public class SupplierInfo
    {
        public string Name { get; set; }
        public string Contact { get; set; }
        public DateTime? LastPurchase { get; set; }
    }

    public class InventoryStats
    {
        public List<InventoryMovement> RecentMovements { get; set; }
        public int TotalMovementsThisWeek { get; set; }
        public int PendingApprovals { get; set; }
    }

    public class InventoryMovement
    {
        public string Type { get; set; }
        public string Product { get; set; }
        public int Quantity { get; set; }
        public DateTime Date { get; set; }
    }

    public class AlertStats
    {
        public int ActiveAlerts { get; set; }
        public int UnacknowledgedAlerts { get; set; }
        public List<AlertInfo> AlertList { get; set; }
    }

    public class AlertInfo
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public string Message { get; set; }
        public string ProductName { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? AcknowledgedDate { get; set; }
    }

    public class RecentActivity
    {
        public string Type { get; set; }
        public string Description { get; set; }
        public DateTime Timestamp { get; set; }
        public string User { get; set; }
        public string Icon { get; set; }
    }

    public class SalesData
    {
        public List<MonthlySale> MonthlySales { get; set; }
        public List<ProductSale> TopProducts { get; set; }
        public decimal TotalThisMonth { get; set; }
        public decimal GrowthRate { get; set; }
    }

    public class MonthlySale
    {
        public string Month { get; set; }
        public decimal Amount { get; set; }
    }

    public class ProductSale
    {
        public string ProductName { get; set; }
        public decimal Sales { get; set; }
        public int Units { get; set; }
    }

    public class ProductionData
    {
        public int PlannedProduction { get; set; }
        public int ActualProduction { get; set; }
        public decimal EfficiencyRate { get; set; }
        public int UpcomingHarvests { get; set; }
        public int ActiveCultivationCycles { get; set; }
    }
}