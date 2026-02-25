

-- =============================================
-- TIPOS_CLIENTE
-- =============================================
CREATE PROCEDURE [dbo].[AgregarTipoCliente]
    @codigo nvarchar(30), @nombre nvarchar(50),
    @descripcion nvarchar(max) = NULL, @descuento_default decimal(5,2) = 0, @activo bit = 1
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            INSERT INTO [dbo].[Tipos_Cliente] ([codigo],[nombre],[descripcion],[descuento_default],[activo])
            VALUES (@codigo,@nombre,@descripcion,@descuento_default,@activo)
            SELECT SCOPE_IDENTITY() AS tipo_cliente_id
        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
        THROW
    END CATCH
END