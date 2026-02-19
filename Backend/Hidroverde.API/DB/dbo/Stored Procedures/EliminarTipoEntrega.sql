
-- ELIMINAR TIPO ENTREGA
CREATE PROCEDURE [dbo].[EliminarTipoEntrega]
    @tipo_entrega_id int
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION
        DELETE FROM [dbo].[Tipos_Entrega]
        WHERE tipo_entrega_id = @tipo_entrega_id
        
        SELECT @tipo_entrega_id AS tipo_entrega_id
    COMMIT TRANSACTION
END