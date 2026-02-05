
-- Obtener Todas las Unidades de Medida
CREATE PROCEDURE [dbo].[ObtenerUnidadesMedida]
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT *
    FROM [dbo].[Unidades_Medida]
    ORDER BY nombre
END