using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using DA.Repositorios;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DA
{
    public class TiposRecursoDA : ITiposRecursoDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public TiposRecursoDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<IEnumerable<TipoRecursoResponse>> ObtenerActivos()
        {
            // Si preferís SP, lo cambiamos; por ahora query simple y estable.
            const string query = @"
                SELECT
                    tipo_recurso_id AS TipoRecursoId,
                    codigo AS Codigo,
                    nombre AS Nombre,
                    categoria AS Categoria,
                    unidad AS Unidad,
                    activo AS Activo
                FROM dbo.Tipos_Recurso
                WHERE activo = 1
                ORDER BY categoria, nombre;";

            var resultado = await _sqlConnection.QueryAsync<TipoRecursoResponse>(query);
            return resultado;
        }
    }
}
