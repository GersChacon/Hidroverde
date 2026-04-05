
-- Obtener Todas las Variedades con Informaci�n de Categor�a y Tipo de Cultivo
CREATE PROCEDURE [dbo].[ObtenerVariedades]
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT v.*, 
           c.nombre AS categoria_nombre,
           tc.nombre AS tipo_cultivo_nombre
    FROM [dbo].[Variedades] v
    INNER JOIN [dbo].[Categorias] c ON v.categoria_id = c.categoria_id
    INNER JOIN [dbo].[Tipos_Cultivo] tc ON c.tipo_cultivo_id = tc.tipo_cultivo_id
    ORDER BY v.nombre_variedad
END