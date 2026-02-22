
-- ELIMINAR
CREATE PROCEDURE [dbo].[EliminarMetodoPago]
    @metodo_pago_id int
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRANSACTION
        DELETE FROM [dbo].[Metodos_Pago]
        WHERE metodo_pago_id = @metodo_pago_id

        SELECT @metodo_pago_id AS metodo_pago_id
    COMMIT TRANSACTION
END