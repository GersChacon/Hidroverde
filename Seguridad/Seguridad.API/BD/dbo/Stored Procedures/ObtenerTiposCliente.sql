
CREATE PROCEDURE [dbo].[ObtenerTiposCliente]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM [dbo].[Tipos_Cliente] ORDER BY nombre
END