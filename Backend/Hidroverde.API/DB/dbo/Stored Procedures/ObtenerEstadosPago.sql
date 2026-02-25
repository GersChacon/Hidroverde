
CREATE PROCEDURE [dbo].[ObtenerEstadosPago]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM [dbo].[Estados_Pago] ORDER BY nombre
END