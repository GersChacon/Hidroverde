// DailyManualController.cs (Updated)
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using HidroverdeDigital.Data;
using HidroverdeDigital.Models;
using System.Collections.Generic;

namespace HidroverdeDigital.Controllers
{
    public class DailyManualController : Controller
    {
        private readonly ApplicationDbContext _context;

        public DailyManualController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: /DailyManual
        public async Task<IActionResult> Index()
        {
            try
            {
                var today = DateTime.Today;
                var empleadoId = GetCurrentEmployeeId();

                // Get all active processes
                var processes = await _context.DailyProcesses
                    .Where(p => p.IsActive)
                    .OrderBy(p => p.Category == "Opening" ? 1 :
                                  p.Category == "Operation" ? 2 :
                                  p.Category == "Closing" ? 3 : 4)
                    .ThenBy(p => p.StepNumber)
                    .ToListAsync();

                // Get today's completions
                var completions = await _context.DailyProcessCompletions
                    .Include(c => c.Empleado)
                    .Where(c => c.CompletionDate == today &&
                               (empleadoId == null || c.EmpleadoId == empleadoId))
                    .ToListAsync();

                ViewBag.Today = today.ToString("dddd, dd MMMM yyyy", new System.Globalization.CultureInfo("es-ES"));
                ViewBag.Completions = completions;
                ViewBag.EmpleadoId = empleadoId;
                ViewBag.TotalMinutes = processes.Sum(p => p.EstimatedMinutes ?? 0);

                return View(processes);
            }
            catch (Exception ex)
            {
                ViewBag.Error = "Error loading daily manual: " + ex.Message;
                return View(new List<DailyProcess>());
            }
        }

        // GET: /DailyManual/GetProgress
        [HttpGet]
        public async Task<IActionResult> GetProgress()
        {
            try
            {
                var today = DateTime.Today;
                var empleadoId = GetCurrentEmployeeId();

                var totalProcesses = await _context.DailyProcesses
                    .Where(p => p.IsActive)
                    .CountAsync();

                var completedProcesses = await _context.DailyProcessCompletions
                    .Where(c => c.CompletionDate == today &&
                               c.Status == "COMPLETED" &&
                               (empleadoId == null || c.EmpleadoId == empleadoId))
                    .CountAsync();

                return Json(new
                {
                    total = totalProcesses,
                    completed = completedProcesses,
                    pending = totalProcesses - completedProcesses
                });
            }
            catch (Exception ex)
            {
                return Json(new { total = 0, completed = 0, pending = 0 });
            }
        }

        // POST: /DailyManual/MarkComplete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> MarkComplete(int id, string observations = "")
        {
            try
            {
                var empleadoId = GetCurrentEmployeeId();
                if (empleadoId == null)
                    return Json(new { success = false, message = "Usuario no autenticado" });

                var today = DateTime.Today;

                // Check if process exists
                var process = await _context.DailyProcesses.FindAsync(id);
                if (process == null)
                    return Json(new { success = false, message = "Proceso no encontrado" });

                // Check if already completed today
                var existing = await _context.DailyProcessCompletions
                    .FirstOrDefaultAsync(c => c.ProcessId == id &&
                                             c.EmpleadoId == empleadoId &&
                                             c.CompletionDate == today);

                if (existing != null)
                {
                    existing.Status = "COMPLETED";
                    existing.Observations = observations;
                    existing.CompletionTime = DateTime.Now;
                    _context.DailyProcessCompletions.Update(existing);
                }
                else
                {
                    var completion = new DailyProcessCompletion
                    {
                        ProcessId = id,
                        EmpleadoId = empleadoId.Value,
                        CompletionDate = today,
                        Observations = observations,
                        Status = "COMPLETED",
                        CompletionTime = DateTime.Now
                    };
                    await _context.DailyProcessCompletions.AddAsync(completion);
                }

                await _context.SaveChangesAsync();
                return Json(new { success = true, message = "Proceso marcado como completado" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error: " + ex.Message });
            }
        }

        // POST: /DailyManual/ResetToday
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ResetToday()
        {
            try
            {
                var empleadoId = GetCurrentEmployeeId();
                if (empleadoId == null)
                    return Json(new { success = false, message = "Usuario no autenticado" });

                var today = DateTime.Today;

                var completions = await _context.DailyProcessCompletions
                    .Where(c => c.CompletionDate == today && c.EmpleadoId == empleadoId)
                    .ToListAsync();

                _context.DailyProcessCompletions.RemoveRange(completions);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Manual diario reiniciado para hoy" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error: " + ex.Message });
            }
        }

        // GET: /DailyManual/GetProcessStatus/5
        [HttpGet]
        public async Task<IActionResult> GetProcessStatus(int id)
        {
            try
            {
                var empleadoId = GetCurrentEmployeeId();
                var today = DateTime.Today;

                var completion = await _context.DailyProcessCompletions
                    .FirstOrDefaultAsync(c => c.ProcessId == id &&
                                             c.EmpleadoId == empleadoId &&
                                             c.CompletionDate == today);

                return Json(new
                {
                    completed = completion != null && completion.Status == "COMPLETED",
                    status = completion?.Status ?? "PENDING",
                    completionTime = completion?.CompletionTime.ToString("HH:mm"),
                    observations = completion?.Observations
                });
            }
            catch (Exception ex)
            {
                return Json(new { completed = false, status = "ERROR", error = ex.Message });
            }
        }

        private int? GetCurrentEmployeeId()
        {
            // Check session first
            var empleadoIdString = HttpContext.Session.GetString("EmpleadoId");
            if (!string.IsNullOrEmpty(empleadoIdString) && int.TryParse(empleadoIdString, out int id))
            {
                return id;
            }

            // Check for user claim (if using authentication)
            var userIdClaim = User?.FindFirst("EmpleadoId")?.Value;
            if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int claimId))
            {
                return claimId;
            }

            // Check query string for testing (remove in production)
            var queryId = HttpContext.Request.Query["empleadoId"].FirstOrDefault();
            if (!string.IsNullOrEmpty(queryId) && int.TryParse(queryId, out int queryIntId))
            {
                HttpContext.Session.SetString("EmpleadoId", queryIntId.ToString());
                return queryIntId;
            }

            // Default for demo - remove this in production
            // For testing, you can hardcode an employee ID that exists in your database
            return 1; // Make sure employee with ID 1 exists in your database
        }
    }
}