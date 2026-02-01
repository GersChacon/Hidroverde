
-- Obtener Categoria con Información del Tipo de Cultivo
CREATE PROCEDURE [dbo].[ObtenerCategoria]
    @categoria_id int
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT c.*, tc.nombre AS tipo_cultivo_nombre
    FROM [dbo].[Categorias] c
    INNER JOIN [dbo].[Tipos_Cultivo] tc ON c.tipo_cultivo_id = tc.tipo_cultivo_id
    WHERE c.categoria_id = @categoria_id
END