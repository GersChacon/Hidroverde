using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos.Evidence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EvidenceController : ControllerBase
    {
        private readonly IEvidenceFlujo _evidenceFlujo;

        public EvidenceController(IEvidenceFlujo evidenceFlujo)
        {
            _evidenceFlujo = evidenceFlujo;
        }

        /// <summary>
        /// Upload evidence (photo/document) for a completed task.
        /// </summary>
        /// <param name="taskId">ID of the task.</param>
        /// <param name="empleadoId">ID of the employee (header X-Empleado-Id).</param>
        /// <param name="file">The file to upload.</param>
        /// <param name="notes">Optional notes.</param>
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(EvidenceUploadResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Upload(
            [FromForm] Abstracciones.Modelos.Evidence.EvidenceUploadRequest request,
            [FromHeader(Name = "X-Empleado-Id")] int empleadoId)
        {
            if (empleadoId <= 0)
                return BadRequest("Header X-Empleado-Id inválido.");
            if (request == null || request.TaskId <= 0)
                return BadRequest("taskId inválido.");

            try
            {
                var result = await _evidenceFlujo.UploadEvidenceAsync(request.TaskId, empleadoId, request.File, request.Notes);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}