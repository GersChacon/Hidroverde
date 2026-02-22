

-- =============================================
-- ESTADOS_PAGO
-- =============================================
CREATE PROCEDURE [dbo].[AgregarEstadoPago]
    @codigo nvarchar(30), @nombre nvarchar(50), @permite_entrega bit = 0,
    @color nvarchar(20) = NULL, @descripcion nvarchar(max) = NULL, @activo bit = 1
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            INSERT INTO [dbo].[Estados_Pago] ([codigo],[nombre],[permite_entrega],[color],[descripcion],[activo])
            VALUES (@codigo,@nombre,@permite_entrega,@color,@descripcion,@activo)
            SELECT SCOPE_IDENTITY() AS estado_pago_id
        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
        THROW
    END CATCH
END