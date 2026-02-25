
CREATE PROCEDURE [dbo].[ObtenerEstadoPago]
    @estado_pago_id int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM [dbo].[Estados_Pago] WHERE estado_pago_id=@estado_pago_id
END