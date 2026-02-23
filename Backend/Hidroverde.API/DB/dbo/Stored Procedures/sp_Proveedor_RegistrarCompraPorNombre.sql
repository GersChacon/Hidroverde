CREATE   PROCEDURE dbo.sp_Proveedor_RegistrarCompraPorNombre
    @nombre_proveedor NVARCHAR(200),
    @monto_compra     DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;

    IF (@monto_compra IS NULL OR @monto_compra <= 0)
        THROW 50200, 'El monto de compra debe ser mayor a 0.', 1;

    DECLARE @proveedor_id INT;

    SELECT TOP 1 @proveedor_id = proveedor_id
    FROM dbo.Proveedores
    WHERE nombre = @nombre_proveedor AND activo = 1;

    IF (@proveedor_id IS NULL)
        THROW 50201, 'Proveedor no existe o está inactivo.', 1;

    -- Asegurar fila de saldo
    IF NOT EXISTS (SELECT 1 FROM dbo.Proveedores_Saldo WHERE proveedor_id = @proveedor_id)
    BEGIN
        INSERT INTO dbo.Proveedores_Saldo (proveedor_id, total_compras, total_pagado)
        VALUES (@proveedor_id, 0, 0);
    END

    UPDATE dbo.Proveedores_Saldo
    SET total_compras = total_compras + @monto_compra,
        fecha_actualizacion = SYSDATETIME()
    WHERE proveedor_id = @proveedor_id;

    -- devolver estado actualizado (para UI)
    SELECT
        p.proveedor_id  AS ProveedorId,
        p.nombre        AS Nombre,
        s.total_compras AS TotalCompras,
        s.total_pagado  AS TotalPagado,
        (s.total_compras - s.total_pagado) AS SaldoPendiente,
        CASE
            WHEN s.total_compras = 0 THEN 'SIN_COMPRAS'
            WHEN s.total_pagado = 0 THEN 'PENDIENTE'
            WHEN s.total_pagado < s.total_compras THEN 'PARCIAL'
            ELSE 'TOTAL'
        END AS EstadoPago
    FROM dbo.Proveedores_Saldo s
    JOIN dbo.Proveedores p ON p.proveedor_id = s.proveedor_id
    WHERE s.proveedor_id = @proveedor_id;
END