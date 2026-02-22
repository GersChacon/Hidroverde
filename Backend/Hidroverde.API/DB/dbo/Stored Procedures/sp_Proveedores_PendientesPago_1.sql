CREATE   PROCEDURE dbo.sp_Proveedores_PendientesPago
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.proveedor_id,
        p.nombre,
        ISNULL(s.total_compras, 0) AS total_compras,
        ISNULL(s.total_pagado, 0)  AS total_pagado,
        (ISNULL(s.total_compras, 0) - ISNULL(s.total_pagado, 0)) AS saldo_pendiente,
        'PENDIENTE' AS estado_pago
    FROM dbo.Proveedores p
    INNER JOIN dbo.Proveedores_Saldo s 
        ON s.proveedor_id = p.proveedor_id
    WHERE p.activo = 1
      AND (s.total_compras - s.total_pagado) > 0
    ORDER BY saldo_pendiente DESC;
END