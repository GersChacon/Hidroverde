using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos.Evidence;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Flujo
{
    public class EvidenceFlujo : IEvidenceFlujo
    {
        private readonly IEvidenceDA _evidenceDA;
        private readonly IChecklistDA _checklistDA; // add dependency

        public EvidenceFlujo(IEvidenceDA evidenceDA, IChecklistDA checklistDA)
        {
            _evidenceDA = evidenceDA;
            _checklistDA = checklistDA;
        }

        public async Task<EvidenceUploadResponse> UploadEvidenceAsync(int taskId, int empleadoId, IFormFile file, string? notes)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("No file provided.");

            // Validate file type and size
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf", ".docx" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
                throw new ArgumentException("File type not allowed. Allowed types: jpg, jpeg, png, pdf, docx");
            if (file.Length > 10 * 1024 * 1024)
                throw new ArgumentException("File size exceeds 10MB limit.");

            // Business logic: ensure task completion record exists
            var cicloChecklistId = await EnsureTaskCompletionRecord(taskId, empleadoId);
            if (cicloChecklistId == null)
                throw new Exception("No se pudo crear un registro de checklist para esta tarea.");

            // Generate unique filename
            string fileName = $"{Guid.NewGuid()}{extension}";
            string filePath = $"/uploads/evidence/{fileName}"; // adjust as needed

            // Save metadata
            int evidenceId = await _evidenceDA.SaveEvidenceAsync(cicloChecklistId.Value, empleadoId, fileName, filePath, notes);

            return new EvidenceUploadResponse
            {
                EvidenceId = evidenceId,
                FileName = fileName,
                UploadedAt = DateTime.Now,
                Message = "Evidence uploaded successfully."
            };
        }

        private async Task<int?> EnsureTaskCompletionRecord(int taskId, int empleadoId)
        {
            // Check if completion record exists
            var existing = await _checklistDA.ObtenerChecklistHoy(empleadoId); // or a specific method
            // This is simplified; you might need a dedicated method to get ciclo_checklist_id by task and employee
            // For now, assume we call a method that returns the ciclo_checklist_id if already completed.
            // If not, create a new completion record using _checklistDA.MarcarTareaCompletada or similar.
            // Placeholder: return taskId as ciclo_checklist_id (but it's likely different).
            // You'll need to implement proper logic here.
            return taskId; // replace with actual logic
        }
    }
}