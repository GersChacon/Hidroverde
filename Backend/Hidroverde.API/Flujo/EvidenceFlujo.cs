using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos.Evidence;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Flujo
{
    public class EvidenceFlujo : IEvidenceFlujo
    {
        private readonly IEvidenceDA _evidenceDA;

        public EvidenceFlujo(IEvidenceDA evidenceDA)
        {
            _evidenceDA = evidenceDA;
        }

        public async Task<EvidenceUploadResponse> UploadEvidenceAsync(int taskId, int empleadoId, IFormFile file, string? notes)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("No file provided.");

            // Validate file type (optional)
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf", ".docx" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
                throw new ArgumentException("File type not allowed.");

            // For MVP, we simulate storing the file. In production, you would save to disk/cloud.
            // Here we just generate a dummy file path.
            string fileName = $"{Guid.NewGuid()}{extension}";
            string filePath = $"/uploads/evidence/{fileName}"; // simulated path

            // Save metadata via DA
            int evidenceId = await _evidenceDA.SaveEvidenceAsync(taskId, empleadoId, fileName, filePath, notes);

            return new EvidenceUploadResponse
            {
                EvidenceId = evidenceId,
                FileName = fileName,
                UploadedAt = DateTime.Now,
                Message = "Evidence uploaded successfully."
            };
        }
    }
}