
-- =============================================
-- ELIMINAR ESTADO VENTA
-- =============================================
CREATE PROCEDURE [dbo].[EliminarEstadoVenta]
    @estado_venta_id int
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION
        DELETE FROM [dbo].[Estados_Venta]
        WHERE estado_venta_id = @estado_venta_id
        
        SELECT @estado_venta_id AS estado_venta_id
    COMMIT TRANSACTION
END