

-- =============================================
-- CLIENTES
-- =============================================
CREATE PROCEDURE [dbo].[AgregarCliente]
    @tipo_cliente_id int, @cedula_ruc nvarchar(20) = NULL, @nombre nvarchar(50),
    @apellidos nvarchar(50) = NULL, @telefono nvarchar(20), @email nvarchar(100),
    @notas nvarchar(max) = NULL, @activo bit = 1
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            INSERT INTO [dbo].[Clientes]
                ([tipo_cliente_id],[cedula_ruc],[nombre],[apellidos],[telefono],[email],[notas],[activo])
            VALUES
                (@tipo_cliente_id,@cedula_ruc,@nombre,@apellidos,@telefono,@email,@notas,@activo)
            SELECT SCOPE_IDENTITY() AS cliente_id
        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
        THROW
    END CATCH
END