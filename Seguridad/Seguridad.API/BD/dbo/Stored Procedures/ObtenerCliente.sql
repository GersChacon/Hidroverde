
CREATE PROCEDURE [dbo].[ObtenerCliente]
    @cliente_id int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT c.*, tc.nombre AS nombre_tipo_cliente, tc.descuento_default
    FROM [dbo].[Clientes] c
    INNER JOIN [dbo].[Tipos_Cliente] tc ON c.tipo_cliente_id = tc.tipo_cliente_id
    WHERE c.cliente_id=@cliente_id
END