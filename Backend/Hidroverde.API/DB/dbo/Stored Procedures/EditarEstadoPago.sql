
CREATE PROCEDURE [dbo].[EditarEstadoPago]
    @estado_pago_id int, @codigo nvarchar(30), @nombre nvarchar(50), @permite_entrega bit,
    @color nvarchar(20) = NULL, @descripcion nvarchar(max) = NULL, @activo bit = 1
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            UPDATE [dbo].[Estados_Pago]
            SET [codigo]=@codigo,[nombre]=@nombre,[permite_entrega]=@permite_entrega,[color]=@color,[descripcion]=@descripcion,[activo]=@activo
            WHERE estado_pago_id=@estado_pago_id
            SELECT @estado_pago_id AS estado_pago_id
        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
        THROW
    END CATCH
END