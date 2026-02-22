
CREATE PROCEDURE [dbo].[EditarTipoCliente]
    @tipo_cliente_id int, @codigo nvarchar(30), @nombre nvarchar(50),
    @descripcion nvarchar(max) = NULL, @descuento_default decimal(5,2) = 0, @activo bit = 1
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            UPDATE [dbo].[Tipos_Cliente]
            SET [codigo]=@codigo,[nombre]=@nombre,[descripcion]=@descripcion,[descuento_default]=@descuento_default,[activo]=@activo
            WHERE tipo_cliente_id=@tipo_cliente_id
            SELECT @tipo_cliente_id AS tipo_cliente_id
        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
        THROW
    END CATCH
END