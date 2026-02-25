
-- OBTENER UNO
CREATE PROCEDURE [dbo].[ObtenerMetodoPago]
    @metodo_pago_id int
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM [dbo].[Metodos_Pago]
    WHERE metodo_pago_id = @metodo_pago_id
END