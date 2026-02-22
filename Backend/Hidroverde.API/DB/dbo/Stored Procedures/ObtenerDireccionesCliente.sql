
CREATE PROCEDURE [dbo].[ObtenerDireccionesCliente]
    @cliente_id int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT d.*, c.nombre AS nombre_cliente
    FROM [dbo].[Direcciones_Clientes] d
    INNER JOIN [dbo].[Clientes] c ON d.cliente_id = c.cliente_id
    WHERE d.cliente_id=@cliente_id
    ORDER BY d.activa DESC, d.alias
END