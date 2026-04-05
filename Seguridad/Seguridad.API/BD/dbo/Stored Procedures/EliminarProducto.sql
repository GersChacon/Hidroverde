CREATE PROCEDURE [dbo].[EliminarProducto]
    @producto_id int
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRAN;

        DELETE FROM dbo.Productos
        WHERE producto_id = @producto_id;

        IF @@ROWCOUNT = 0
            THROW 51031, 'Producto no existe.', 1;

        COMMIT;

        SELECT @producto_id AS producto_id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;

        -- 547 = violación de FK (referenced by constraint)
        IF ERROR_NUMBER() = 547
            THROW 51030, 'No se puede eliminar: el producto tiene registros relacionados.', 1;

        THROW;
    END CATCH
END