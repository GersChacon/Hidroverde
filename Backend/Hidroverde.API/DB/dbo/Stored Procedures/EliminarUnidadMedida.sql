CREATE PROCEDURE [dbo].[EliminarUnidadMedida]
    @unidad_id int
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION
        DELETE FROM [dbo].[Unidades_Medida]
        WHERE unidad_id = @unidad_id
        
        SELECT @unidad_id AS unidad_id
    COMMIT TRANSACTION
END