
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	CRUD para Tipos_Cultivo
-- =============================================

-- Agregar Tipo de Cultivo
CREATE PROCEDURE [dbo].[AgregarTipoCultivo]
    @codigo nvarchar(30),
    @nombre nvarchar(51),
    @descripcion nvarchar(max) = NULL,
    @requisitos nvarchar(max) = NULL,
    @activo bit = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION
        INSERT INTO [dbo].[Tipos_Cultivo] 
        ([codigo], [nombre], [descripcion], [requisitos], [activo])
        VALUES 
        (@codigo, @nombre, @descripcion, @requisitos, @activo)
        
        SELECT SCOPE_IDENTITY() AS tipo_cultivo_id
    COMMIT TRANSACTION
END