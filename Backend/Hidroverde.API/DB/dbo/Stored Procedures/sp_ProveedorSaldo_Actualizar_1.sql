CREATE PROCEDURE sp_ProveedorSaldo_Actualizar
    @proveedor_id INT,
    @monto_compra DECIMAL(18,2) = 0,
    @monto_pago   DECIMAL(18,2) = 0
AS
BEGIN
    SET NOCOUNT ON;

    IF (@monto_compra < 0 OR @monto_pago < 0)
        THROW 50001, 'Los montos no pueden ser negativos.', 1;

    -- Asegura que exista el proveedor
    IF NOT EXISTS (SELECT 1 FROM dbo.Proveedores WHERE proveedor_id = @proveedor_id AND activo = 1)
        THROW 50002, 'Proveedor no existe o está inactivo.', 1;

    -- Crear fila si no existe
    IF NOT EXISTS (SELECT 1 FROM dbo.Proveedores_Saldo WHERE proveedor_id = @proveedor_id)
    BEGIN
        INSERT INTO dbo.Proveedores_Saldo (proveedor_id, total_compras, total_pagado)
        VALUES (@proveedor_id, 0, 0);
    END

    -- Validar que no se pague más de lo debido (considerando el nuevo pago)
    DECLARE @total_compras_actual DECIMAL(18,2),
            @total_pagado_actual  DECIMAL(18,2);

    SELECT
        @total_compras_actual = total_compras,
        @total_pagado_actual  = total_pagado
    FROM dbo.Proveedores_Saldo
    WHERE proveedor_id = @proveedor_id;

    IF (@total_pagado_actual + @monto_pago) > (@total_compras_actual + @monto_compra)
        THROW 50003, 'El pago excede el total de compras.', 1;

    -- Actualizar acumulados
    UPDATE dbo.Proveedores_Saldo
    SET total_compras = total_compras + @monto_compra,
        total_pagado  = total_pagado  + @monto_pago,
        fecha_actualizacion = SYSDATETIME()
    WHERE proveedor_id = @proveedor_id;
END