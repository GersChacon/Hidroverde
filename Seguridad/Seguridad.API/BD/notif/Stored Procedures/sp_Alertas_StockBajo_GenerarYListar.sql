
CREATE   PROCEDURE [notif].[sp_Alertas_StockBajo_GenerarYListar]
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @stock_minimo_general INT;

    SELECT TOP (1)
        @stock_minimo_general = TRY_CONVERT(INT, cs.valor)
    FROM dbo.Config_Sistema cs
    WHERE cs.clave = N'stock_minimo_general'
      AND cs.activo = 1
    ORDER BY cs.config_id DESC;

    IF @stock_minimo_general IS NULL
        SET @stock_minimo_general = 15;

    BEGIN TRY
        SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
        BEGIN TRAN;

        /* Tabla temporal reutilizable */
        IF OBJECT_ID('tempdb..#Stock') IS NOT NULL DROP TABLE #Stock;

        CREATE TABLE #Stock
        (
            producto_id INT NOT NULL PRIMARY KEY,
            nombre_producto NVARCHAR(400) NOT NULL,
            disponible_total INT NOT NULL,
            minimo INT NOT NULL
        );

        INSERT INTO #Stock (producto_id, nombre_producto, disponible_total, minimo)
        SELECT
            p.producto_id,
            p.nombre_producto,
            ISNULL(SUM(ia.cantidad_disponible), 0) AS disponible_total,
            COALESCE(p.stock_minimo, @stock_minimo_general) AS minimo
        FROM dbo.Productos p
        LEFT JOIN dbo.Inventario_Actual ia
            ON ia.producto_id = p.producto_id
        GROUP BY p.producto_id, p.nombre_producto, p.stock_minimo;

        /* 1) REARMAR: si se recuperó (> mínimo), marcar rearmado_en en aceptadas bloqueantes */
        UPDATE a
        SET a.rearmado_en = SYSDATETIME()
        FROM notif.Alerta a
        JOIN #Stock s ON s.producto_id = a.producto_id
        WHERE a.tipo_alerta = 'STOCK_BAJO'
          AND a.estado = 'ACEPTADA'
          AND a.rearmado_en IS NULL
          AND s.disponible_total > s.minimo;

        /* 2) GENERAR: si está bajo y NO hay ACTIVA y NO hay ACEPTADA bloqueante */
        INSERT INTO notif.Alerta
        (
            tipo_alerta, producto_id, estado, mensaje,
            snapshot_disponible, snapshot_minimo
        )
        SELECT
            'STOCK_BAJO',
            s.producto_id,
            'ACTIVA',
            CONCAT(N'Stock bajo en ', s.nombre_producto, N' disponible ', s.disponible_total),
            s.disponible_total,
            s.minimo
        FROM #Stock s
        WHERE s.disponible_total <= s.minimo
          AND NOT EXISTS
          (
              SELECT 1
              FROM notif.Alerta a WITH (UPDLOCK, HOLDLOCK)
              WHERE a.tipo_alerta = 'STOCK_BAJO'
                AND a.producto_id = s.producto_id
                AND a.estado = 'ACTIVA'
          )
          AND NOT EXISTS
          (
              SELECT 1
              FROM notif.Alerta a2
              WHERE a2.tipo_alerta = 'STOCK_BAJO'
                AND a2.producto_id = s.producto_id
                AND a2.estado = 'ACEPTADA'
                AND a2.rearmado_en IS NULL
          );

        COMMIT;

        /* Dataset 1: badge_count (solo ACTIVA) */
        SELECT COUNT(*) AS badge_count
        FROM notif.Alerta
        WHERE estado = 'ACTIVA';

        /* Dataset 2: lista de alertas ACTIVAS */
        SELECT
            a.alerta_id,
            a.tipo_alerta,
            a.estado,
            a.fecha_creacion,
            a.mensaje,
            a.producto_id,
            p.nombre_producto,
            a.snapshot_disponible,
            a.snapshot_minimo,
            disponible_actual = s.disponible_total,
            minimo_actual = s.minimo
        FROM notif.Alerta a
        JOIN dbo.Productos p ON p.producto_id = a.producto_id
        JOIN #Stock s ON s.producto_id = a.producto_id
        WHERE a.estado = 'ACTIVA'
        ORDER BY a.fecha_creacion DESC, a.alerta_id DESC;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH
END