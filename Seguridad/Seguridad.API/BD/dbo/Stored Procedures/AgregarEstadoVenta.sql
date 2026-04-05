-- =============================================
-- PROCEDIMIENTOS PARA ESTADOS DE VENTA
-- =============================================

-- AGREGAR ESTADO VENTA
CREATE PROCEDURE [dbo].[AgregarEstadoVenta]
    @codigo nvarchar(30),
    @nombre nvarchar(50),
    @orden int = NULL,
    @color nvarchar(20) = NULL,
    @permite_modificacion bit,
    @descripcion nvarchar(max) = NULL,
    @activo bit = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION
        INSERT INTO [dbo].[Estados_Venta] 
        ([codigo], [nombre], [orden], [color], 
         [permite_modificacion], [descripcion], [activo])
        VALUES 
        (@codigo, @nombre, @orden, @color, 
         @permite_modificacion, @descripcion, @activo)
        
        SELECT SCOPE_IDENTITY() AS estado_venta_id
    COMMIT TRANSACTION
END