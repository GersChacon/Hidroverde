
-- Obtener Unidad de Medida
CREATE PROCEDURE [dbo].[ObtenerUnidadMedida]
    @unidad_id int
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT *
    FROM [dbo].[Unidades_Medida]
    WHERE unidad_id = @unidad_id
END