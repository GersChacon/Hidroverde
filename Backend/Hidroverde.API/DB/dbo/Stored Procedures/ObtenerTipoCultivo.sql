
-- Modificar ObtenerTipoCultivo
CREATE PROCEDURE [dbo].[ObtenerTipoCultivo]
    @tipo_cultivo_id int
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
    WHERE tipo_cultivo_id = @tipo_cultivo_id
END