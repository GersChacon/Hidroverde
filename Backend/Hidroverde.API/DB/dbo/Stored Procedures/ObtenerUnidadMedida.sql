
-- Modificar ObtenerUnidadMedida
CREATE PROCEDURE [dbo].[ObtenerUnidadMedida]
    @unidad_id int
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        unidad_id AS UnidadId,
        codigo AS Codigo,
        nombre AS Nombre,
        simbolo AS Simbolo,
        tipo AS Tipo,
        activo AS Activo
    FROM [dbo].[Unidades_Medida]
    WHERE unidad_id = @unidad_id
END