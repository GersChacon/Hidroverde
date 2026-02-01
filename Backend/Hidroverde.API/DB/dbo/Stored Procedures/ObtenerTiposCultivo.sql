CREATE PROCEDURE [dbo].[ObtenerTiposCultivo]
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT *
    FROM [dbo].[Tipos_Cultivo]
    ORDER BY nombre
END