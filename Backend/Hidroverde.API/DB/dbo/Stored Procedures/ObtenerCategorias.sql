
-- Modificar ObtenerCategorias con alias
CREATE PROCEDURE [dbo].[ObtenerCategorias]
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        c.categoria_id AS CategoriaId,
        c.tipo_cultivo_id AS TipoCultivoId,
        c.nombre AS Nombre,
        c.descripcion AS Descripcion,
        c.requiere_seguimiento AS RequiereSeguimiento,
        c.activa AS Activa,
        c.fecha_creacion AS FechaCreacion,
        tc.nombre AS TipoCultivoNombre
    FROM [dbo].[Categorias] c
    INNER JOIN [dbo].[Tipos_Cultivo] tc ON c.tipo_cultivo_id = tc.tipo_cultivo_id
    ORDER BY c.nombre
END