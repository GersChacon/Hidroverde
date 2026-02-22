
-- EDITAR TIPO ENTREGA
CREATE PROCEDURE [dbo].[EditarTipoEntrega]
    @tipo_entrega_id int,
    @codigo nvarchar(30),
    @nombre nvarchar(50),
    @costo_default decimal(10, 2),
    @descripcion nvarchar(max) = NULL,
    @activo bit
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION
        UPDATE [dbo].[Tipos_Entrega]
        SET [codigo] = @codigo,
            [nombre] = @nombre,
            [costo_default] = @costo_default,
            [descripcion] = @descripcion,
            [activo] = @activo
        WHERE tipo_entrega_id = @tipo_entrega_id
        
        SELECT @tipo_entrega_id AS tipo_entrega_id
    COMMIT TRANSACTION
END