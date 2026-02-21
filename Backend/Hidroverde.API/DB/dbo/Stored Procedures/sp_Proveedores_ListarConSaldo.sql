CREATE   PROCEDURE dbo.sp_Proveedores_ListarConSaldo
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.proveedor_id,
        p.nombre,
        ISNULL(s.total_compras, 0) AS total_compras,
        ISNULL(s.total_pagado, 0)  AS total_pagado,
        ISNULL(s.total_compras, 0) - ISNULL(s.total_pagado, 0) AS saldo_pendiente,
        CASE
            WHEN ISNULL(s.total_compras, 0) = 0 THEN 'SIN_COMPRAS'
            WHEN ISNULL(s.total_pagado, 0) = 0 THEN 'PENDIENTE'
            WHEN ISNULL(s.total_pagado, 0) < ISNULL(s.total_compras, 0) THEN 'PARCIAL'
            ELSE 'TOTAL'
        END AS estado_pago
    FROM dbo.Proveedores p
    LEFT JOIN dbo.Proveedores_Saldo s ON s.proveedor_id = p.proveedor_id
    WHERE p.activo = 1
    ORDER BY p.nombre;
END