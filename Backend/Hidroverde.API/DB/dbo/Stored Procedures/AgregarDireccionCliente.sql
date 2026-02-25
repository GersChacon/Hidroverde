

-- =============================================
-- DIRECCIONES_CLIENTES
-- =============================================
CREATE PROCEDURE [dbo].[AgregarDireccionCliente]
    @cliente_id int, @alias nvarchar(100) = NULL, @direccion_exacta nvarchar(max),
    @referencia nvarchar(max) = NULL, @telefono_contacto nvarchar(20) = NULL,
    @activa bit = 1, @codigo_postal nvarchar(10)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            INSERT INTO [dbo].[Direcciones_Clientes]
                ([cliente_id],[alias],[direccion_exacta],[referencia],[telefono_contacto],[activa],[codigo_postal])
            VALUES
                (@cliente_id,@alias,@direccion_exacta,@referencia,@telefono_contacto,@activa,@codigo_postal)
            SELECT SCOPE_IDENTITY() AS direccion_id
        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
        THROW
    END CATCH
END