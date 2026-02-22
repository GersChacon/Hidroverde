CREATE PROCEDURE [dbo].[sp_Proveedor_RegistrarPago]
    @proveedor_id INT,
    @monto_pago   DECIMAL(18,2),
    @mensaje      NVARCHAR(300) OUTPUT,
    @usuario_id   INT = NULL,
    @comentario   NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRAN;

        IF (@monto_pago IS NULL OR @monto_pago <= 0)
            THROW 50100, 'El monto de pago debe ser mayor a 0.', 1;

        IF NOT EXISTS (SELECT 1 FROM dbo.Proveedores WHERE proveedor_id = @proveedor_id AND activo = 1)
            THROW 50101, 'Proveedor no existe o está inactivo.', 1;

        IF NOT EXISTS (SELECT 1 FROM dbo.Proveedores_Saldo WHERE proveedor_id = @proveedor_id)
        BEGIN
            INSERT INTO dbo.Proveedores_Saldo (proveedor_id, total_compras, total_pagado)
            VALUES (@proveedor_id, 0, 0);
        END

        DECLARE
            @total_compras DECIMAL(18,2),
            @total_pagado  DECIMAL(18,2),
            @saldo         DECIMAL(18,2);

        SELECT
            @total_compras = total_compras,
            @total_pagado  = total_pagado
        FROM dbo.Proveedores_Saldo
        WHERE proveedor_id = @proveedor_id;

        SET @saldo = @total_compras - @total_pagado;

        IF (@saldo <= 0)
            THROW 50102, 'No hay saldo pendiente para este proveedor.', 1;

        IF (@monto_pago > @saldo)
            THROW 50103, 'El pago excede el saldo pendiente.', 1;

        -- Aplicar pago
        UPDATE dbo.Proveedores_Saldo
        SET total_pagado = total_pagado + @monto_pago,
            fecha_actualizacion = SYSDATETIME()
        WHERE proveedor_id = @proveedor_id;

        DECLARE @nuevo_saldo DECIMAL(18,2);
        SET @nuevo_saldo = (@total_compras - (@total_pagado + @monto_pago));

        DECLARE @estado NVARCHAR(20);
        SET @estado = CASE WHEN @nuevo_saldo > 0 THEN 'PARCIAL' ELSE 'TOTAL' END;

        IF (@nuevo_saldo > 0)
            SET @mensaje = CONCAT('Pago parcial registrado. Saldo pendiente: ', FORMAT(@nuevo_saldo, 'N2'));
        ELSE
            SET @mensaje = 'Pago total registrado. Saldo pendiente: 0.00';

        -- ✅ HISTORIAL
        INSERT INTO dbo.Proveedores_Pagos
        (proveedor_id, monto_pago, saldo_antes, saldo_despues, estado_pago, usuario_id, comentario)
        VALUES
        (@proveedor_id, @monto_pago, @saldo, @nuevo_saldo, @estado, @usuario_id, @comentario);

        -- Respuesta UI
        SELECT
            p.proveedor_id AS ProveedorId,
            p.nombre       AS Nombre,
            @total_compras AS TotalCompras,
            (@total_pagado + @monto_pago) AS TotalPagado,
            @nuevo_saldo   AS SaldoPendiente,
            @estado        AS EstadoPago,
            @mensaje       AS Mensaje
        FROM dbo.Proveedores p
        WHERE p.proveedor_id = @proveedor_id;

        COMMIT TRAN;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRAN;
        THROW;
    END CATCH
END