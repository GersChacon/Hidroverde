
-- Modificar ObtenerTiposCultivo
CREATE PROCEDURE [dbo].[ObtenerTiposCultivo]
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        tipo_cultivo_id AS TipoCultivoId,
        codigo AS Codigo,
        nombre AS Nombre,
        descripcion AS Descripcion,
        requisitos AS Requisitos,
        activo AS Activo
    FROM [dbo].[Tipos_Cultivo]
    ORDER BY nombre
END