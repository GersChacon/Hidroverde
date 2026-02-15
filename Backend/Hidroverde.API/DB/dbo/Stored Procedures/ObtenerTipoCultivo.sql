
-- Obtener Tipo de Cultivo
CREATE PROCEDURE [dbo].[ObtenerTipoCultivo]
    @tipo_cultivo_id int
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT *
    FROM [dbo].[Tipos_Cultivo]
    WHERE tipo_cultivo_id = @tipo_cultivo_id
END