
-- =============================================
-- EDITAR ESTADO VENTA
-- =============================================
CREATE PROCEDURE [dbo].[EditarEstadoVenta]
    @estado_venta_id int,
    @codigo nvarchar(30),
    @nombre nvarchar(50),
    @orden int = NULL,
    @color nvarchar(20) = NULL,
    @permite_modificacion bit,
    @descripcion nvarchar(max) = NULL,
    @activo bit
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION
        UPDATE [dbo].[Estados_Venta]
        SET [codigo] = @codigo,
            [nombre] = @nombre,
            [orden] = @orden,
            [color] = @color,
            [permite_modificacion] = @permite_modificacion,
            [descripcion] = @descripcion,
            [activo] = @activo
        WHERE estado_venta_id = @estado_venta_id
        
        SELECT @estado_venta_id AS estado_venta_id
    COMMIT TRANSACTION
END