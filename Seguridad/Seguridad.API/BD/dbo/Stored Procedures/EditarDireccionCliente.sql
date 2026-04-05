
CREATE PROCEDURE [dbo].[EditarDireccionCliente]
    @direccion_id int, @cliente_id int, @alias nvarchar(100) = NULL,
    @direccion_exacta nvarchar(max), @referencia nvarchar(max) = NULL,
    @telefono_contacto nvarchar(20) = NULL, @activa bit = 1, @codigo_postal nvarchar(10)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            UPDATE [dbo].[Direcciones_Clientes]
            SET [alias]=@alias,[direccion_exacta]=@direccion_exacta,[referencia]=@referencia,
                [telefono_contacto]=@telefono_contacto,[activa]=@activa,[codigo_postal]=@codigo_postal
            WHERE direccion_id=@direccion_id AND cliente_id=@cliente_id
            SELECT @direccion_id AS direccion_id
        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
        THROW
    END CATCH
END