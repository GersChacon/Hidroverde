
-- Modificar ObtenerVariedad con alias
CREATE PROCEDURE [dbo].[ObtenerVariedad]
    @variedad_id int
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        v.variedad_id AS VariedadId,
        v.categoria_id AS CategoriaId,
        v.nombre_variedad AS NombreVariedad,
        v.descripcion AS Descripcion,
        v.dias_germinacion AS DiasGerminacion,
        v.dias_cosecha AS DiasCosecha,
        v.temperatura_minima AS TemperaturaMinima,
        v.temperatura_maxima AS TemperaturaMaxima,
        v.ph_minimo AS PhMinimo,
        v.ph_maximo AS PhMaximo,
        v.ec_minimo AS EcMinimo,
        v.ec_maximo AS EcMaximo,
        v.instrucciones_especiales AS InstruccionesEspeciales,
        v.activa AS Activa,
        v.fecha_creacion AS FechaCreacion,
        c.nombre AS CategoriaNombre,
        tc.nombre AS TipoCultivoNombre,
        tc.tipo_cultivo_id AS TipoCultivoId
    FROM [dbo].[Variedades] v
    INNER JOIN [dbo].[Categorias] c ON v.categoria_id = c.categoria_id
    INNER JOIN [dbo].[Tipos_Cultivo] tc ON c.tipo_cultivo_id = tc.tipo_cultivo_id
    WHERE v.variedad_id = @variedad_id
END