using Abstracciones.Interfaces.Flujo;
using Microsoft.AspNetCore.Mvc;
using Abstracciones.Modelos;

namespace API.Controllers
{
    [ApiController]
    [Route("api/torres")]
    public class TorresController : ControllerBase
    {
        private readonly ITorresFlujo _torresFlujo;

        public TorresController(ITorresFlujo torresFlujo)
        {
            _torresFlujo = torresFlujo;
        }

        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var data = await _torresFlujo.Listar();
            return Ok(data);
        }
    }
}