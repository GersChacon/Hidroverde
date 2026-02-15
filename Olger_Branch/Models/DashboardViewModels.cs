// Models/DashboardViewModels.cs
using System;
using System.Collections.Generic;

namespace HidroverdeDigital.Models
{
    // Main Dashboard ViewModel
    public class DashboardViewModel
    {
        public DailyManualProgressVM DailyManualProgress { get; set; }
        public ProductStatsVM ProductStats { get; set; }
        public SupplierStatsVM SupplierStats { get; set; }
        public InventoryStatsVM InventoryStats { get; set; }
        public AlertStatsVM AlertStats { get; set; }
        public List<RecentActivityVM> RecentActivities { get; set; }
        public SalesDataVM SalesData { get; set; }
        public ProductionDataVM ProductionData { get; set; }
    }

    // Daily Manual Progress
    public class DailyManualProgressVM
    {
        public int TotalSteps { get; set; } = 16;
        public int CompletedToday { get; set; } = 8;
        public int CompletionRate { get; set; } = 50;
        public int EstimatedMinutes { get; set; } = 240;
    }

    // Product Statistics
    public class ProductStatsVM
    {
        public int TotalProducts { get; set; } = 35;
        public int ActiveProducts { get; set; } = 32;
        public int ProductsNeedingRestock { get; set; } = 3;
        public List<LowStockProductVM> LowStockProducts { get; set; } = new List<LowStockProductVM>();
    }

    public class LowStockProductVM
    {
        public string ProductName { get; set; }
        public int CurrentStock { get; set; }
        public int MinStock { get; set; }
        public bool IsCritical => CurrentStock < (MinStock * 0.3);
    }

    // Supplier Statistics
    public class SupplierStatsVM
    {
        public int TotalSuppliers { get; set; } = 8;
        public int ActiveSuppliers { get; set; } = 7;
        public List<SupplierInfoVM> RecentSuppliers { get; set; } = new List<SupplierInfoVM>();
    }

    public class SupplierInfoVM
    {
        public string Name { get; set; }
        public string Contact { get; set; }
        public DateTime? LastPurchase { get; set; }
    }

    // Inventory Statistics
    public class InventoryStatsVM
    {
        public List<InventoryMovementVM> RecentMovements { get; set; } = new List<InventoryMovementVM>();
        public int TotalMovementsThisWeek { get; set; } = 15;
        public int PendingApprovals { get; set; } = 3;
    }

    public class InventoryMovementVM
    {
        public string Type { get; set; }
        public string Product { get; set; }
        public int Quantity { get; set; }
        public DateTime Date { get; set; }
    }

    // Alert Statistics
    public class AlertStatsVM
    {
        public int ActiveAlerts { get; set; } = 2;
        public int UnacknowledgedAlerts { get; set; } = 1;
        public List<AlertInfoVM> AlertList { get; set; } = new List<AlertInfoVM>();
    }

    public class AlertInfoVM
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public string Message { get; set; }
        public string ProductName { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    // Recent Activities
    public class RecentActivityVM
    {
        public string Type { get; set; }
        public string Description { get; set; }
        public DateTime Timestamp { get; set; }
        public string User { get; set; }
        public string Icon { get; set; }
    }

    // Sales Data
    public class SalesDataVM
    {
        public List<MonthlySaleVM> MonthlySales { get; set; } = new List<MonthlySaleVM>();
        public List<ProductSaleVM> TopProducts { get; set; } = new List<ProductSaleVM>();
        public decimal TotalThisMonth { get; set; } = 5900000;
        public decimal GrowthRate { get; set; } = 12.5m;
    }

    public class MonthlySaleVM
    {
        public string Month { get; set; }
        public decimal Amount { get; set; }
    }

    public class ProductSaleVM
    {
        public string ProductName { get; set; }
        public decimal Sales { get; set; }
        public int Units { get; set; }
    }

    // Production Data
    public class ProductionDataVM
    {
        public int PlannedProduction { get; set; } = 1500;
        public int ActualProduction { get; set; } = 1420;
        public decimal EfficiencyRate { get; set; } = 94.7m;
        public int UpcomingHarvests { get; set; } = 5;
        public int ActiveCultivationCycles { get; set; } = 12;
    }
}