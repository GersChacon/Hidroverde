
CREATE PROCEDURE [dbo].[EditarCliente]
    @cliente_id int, @tipo_cliente_id int, @cedula_ruc nvarchar(20) = NULL,
    @nombre nvarchar(50), @apellidos nvarchar(50) = NULL, @telefono nvarchar(20),
    @email nvarchar(100), @notas nvarchar(max) = NULL, @activo bit = 1
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            UPDATE [dbo].[Clientes]
            SET [tipo_cliente_id]=@tipo_cliente_id,[cedula_ruc]=@cedula_ruc,[nombre]=@nombre,
                [apellidos]=@apellidos,[telefono]=@telefono,[email]=@email,[notas]=@notas,[activo]=@activo
            WHERE cliente_id=@cliente_id
            SELECT @cliente_id AS cliente_id
        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
        THROW
    END CATCH
END