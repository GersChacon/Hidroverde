
-- SP para obtener dirección (actualizado)
CREATE   PROCEDURE [dbo].[sp_DireccionCliente_Obtener]
    @direccion_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        dc.*,
        c.nombre AS cliente_nombre,
        c.apellidos AS cliente_apellidos
    FROM [dbo].[Direcciones_Clientes] dc
    INNER JOIN [dbo].[Clientes] c ON dc.cliente_id = c.cliente_id
    WHERE dc.direccion_id = @direccion_id
END