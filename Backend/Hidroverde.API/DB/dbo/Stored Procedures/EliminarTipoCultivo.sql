CREATE PROCEDURE [dbo].[EliminarTipoCultivo]
    @tipo_cultivo_id int
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION
        DELETE FROM [dbo].[Tipos_Cultivo]
        WHERE tipo_cultivo_id = @tipo_cultivo_id
        
        SELECT @tipo_cultivo_id AS tipo_cultivo_id
    COMMIT TRANSACTION
END