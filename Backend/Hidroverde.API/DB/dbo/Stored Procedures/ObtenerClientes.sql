
CREATE PROCEDURE [dbo].[ObtenerClientes]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT c.*, tc.nombre AS nombre_tipo_cliente, tc.descuento_default
    FROM [dbo].[Clientes] c
    INNER JOIN [dbo].[Tipos_Cliente] tc ON c.tipo_cliente_id = tc.tipo_cliente_id
    ORDER BY c.nombre
END