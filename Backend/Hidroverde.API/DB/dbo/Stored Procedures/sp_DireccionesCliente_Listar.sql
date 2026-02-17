
-- SP para listar direcciones por cliente
CREATE   PROCEDURE [dbo].[sp_DireccionesCliente_Listar]
    @cliente_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT *
    FROM [dbo].[Direcciones_Clientes]
    WHERE cliente_id = @cliente_id
    ORDER BY activa DESC, fecha_creacion DESC
END