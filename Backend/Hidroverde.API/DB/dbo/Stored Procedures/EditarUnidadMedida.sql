
-- Editar Unidad de Medida
CREATE PROCEDURE [dbo].[EditarUnidadMedida]
    @unidad_id int,
    @codigo nvarchar(20),
    @nombre nvarchar(50),
    @simbolo nvarchar(10) = NULL,
    @tipo nvarchar(30) = NULL,
    @activo bit
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION
        UPDATE [dbo].[Unidades_Medida]
        SET [codigo] = @codigo,
            [nombre] = @nombre,
            [simbolo] = @simbolo,
            [tipo] = @tipo,
            [activo] = @activo
        WHERE unidad_id = @unidad_id
        
        SELECT @unidad_id AS unidad_id
    COMMIT TRANSACTION
END