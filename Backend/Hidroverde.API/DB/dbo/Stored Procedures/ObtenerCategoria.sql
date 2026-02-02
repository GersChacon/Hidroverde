
-- Modificar ObtenerCategoria con alias
CREATE PROCEDURE [dbo].[ObtenerCategoria]
    @categoria_id int
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
    WHERE c.categoria_id = @categoria_id
END