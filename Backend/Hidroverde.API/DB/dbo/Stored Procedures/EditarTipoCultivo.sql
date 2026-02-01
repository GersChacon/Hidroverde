CREATE PROCEDURE [dbo].[EditarTipoCultivo]
    @tipo_cultivo_id int,
    @codigo nvarchar(30),
    @nombre nvarchar(50),
    @descripcion nvarchar(max) = NULL,
    @requisitos nvarchar(max) = NULL,
    @activo bit
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION
        UPDATE [dbo].[Tipos_Cultivo]
        SET [codigo] = @codigo,
            [nombre] = @nombre,
            [descripcion] = @descripcion,
            [requisitos] = @requisitos,
            [activo] = @activo
        WHERE tipo_cultivo_id = @tipo_cultivo_id
        
        SELECT @tipo_cultivo_id AS tipo_cultivo_id
    COMMIT TRANSACTION
END