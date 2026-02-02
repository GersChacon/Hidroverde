using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using Dapper;
using Microsoft.Data.SqlClient;

namespace DA
{
    public class VariedadDA : IVariedadDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public VariedadDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<int> Agregar(VariedadRequest variedad)
        {
            string query = @"AgregarVariedad";

            var resultadoConsulta = await _sqlConnection.ExecuteScalarAsync<int>(query, new
            {
                categoria_id = variedad.CategoriaId,
                nombre_variedad = variedad.NombreVariedad,
                descripcion = variedad.Descripcion,
                dias_germinacion = variedad.DiasGerminacion,
                dias_cosecha = variedad.DiasCosecha,
                temperatura_minima = variedad.TemperaturaMinima,
                temperatura_maxima = variedad.TemperaturaMaxima,
                ph_minimo = variedad.PhMinimo,
                ph_maximo = variedad.PhMaximo,
                ec_minimo = variedad.EcMinimo,
                ec_maximo = variedad.EcMaximo,
                instrucciones_especiales = variedad.InstruccionesEspeciales,
                activa = variedad.Activa
            });

            return resultadoConsulta;
        }

        public async Task<int> Editar(int variedadId, VariedadRequest variedad)
        {
            await VerificarVariedadExiste(variedadId);

            string query = @"EditarVariedad";
            var resultadoConsulta = await _sqlConnection.ExecuteScalarAsync<int>(query, new
            {
                variedad_id = variedadId,
                categoria_id = variedad.CategoriaId,
                nombre_variedad = variedad.NombreVariedad,
                descripcion = variedad.Descripcion,
                dias_germinacion = variedad.DiasGerminacion,
                dias_cosecha = variedad.DiasCosecha,
                temperatura_minima = variedad.TemperaturaMinima,
                temperatura_maxima = variedad.TemperaturaMaxima,
                ph_minimo = variedad.PhMinimo,
                ph_maximo = variedad.PhMaximo,
                ec_minimo = variedad.EcMinimo,
                ec_maximo = variedad.EcMaximo,
                instrucciones_especiales = variedad.InstruccionesEspeciales,
                activa = variedad.Activa
            });

            return resultadoConsulta;
        }

        public async Task<int> Eliminar(int variedadId)
        {
            await VerificarVariedadExiste(variedadId);

            string query = @"EliminarVariedad";
            var resultadoConsulta = await _sqlConnection.ExecuteScalarAsync<int>(query, new
            {
                variedad_id = variedadId
            });

            return resultadoConsulta;
        }

        public async Task<IEnumerable<VariedadResponse>> Obtener()
        {
            string query = @"ObtenerVariedades";
            var resultadoConsulta = await _sqlConnection.QueryAsync<VariedadResponse>(query);
            return resultadoConsulta;
        }

        public async Task<VariedadResponse> Obtener(int variedadId)
        {
            string query = @"ObtenerVariedad";
            var resultadoConsulta = await _sqlConnection.QueryFirstOrDefaultAsync<VariedadResponse>(
                query,
                new { variedad_id = variedadId }
            );

            return resultadoConsulta;
        }

        private async Task VerificarVariedadExiste(int variedadId)
        {
            var resultadoConsulta = await Obtener(variedadId);
            if (resultadoConsulta == null)
                throw new Exception("No se encontró la variedad");
        }
    }
}