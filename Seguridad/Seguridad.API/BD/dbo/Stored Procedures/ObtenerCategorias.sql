
-- Obtener Todas las Categor�as con Informaci�n del Tipo de Cultivo
CREATE PROCEDURE [dbo].[ObtenerCategorias]
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT c.*, tc.nombre AS tipo_cultivo_nombre
    FROM [dbo].[Categorias] c
    INNER JOIN [dbo].[Tipos_Cultivo] tc ON c.tipo_cultivo_id = tc.tipo_cultivo_id
    ORDER BY c.nombre
END