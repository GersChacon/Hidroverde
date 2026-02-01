
-- Eliminar Producto
CREATE PROCEDURE [dbo].[EliminarProducto]
    @producto_id int
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION
        DELETE FROM [dbo].[Productos]
        WHERE producto_id = @producto_id
        
        SELECT @producto_id AS producto_id
    COMMIT TRANSACTION
END