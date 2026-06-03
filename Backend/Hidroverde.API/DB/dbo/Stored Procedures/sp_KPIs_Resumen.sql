CREATE   PROCEDURE [dbo].[sp_KPIs_Resumen]
    @fecha_desde DATE = NULL,
    @fecha_hasta DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @fecha_desde IS NULL
        SET @fecha_desde = DATEFROMPARTS(YEAR(SYSDATETIME()), MONTH(SYSDATETIME()), 1);
    IF @fecha_hasta IS NULL
        SET @fecha_hasta = EOMONTH(SYSDATETIME());
    DECLARE @grafica_desde DATE = DATEFROMPARTS(
        YEAR(DATEADD(MONTH, -5, SYSDATETIME())),
        MONTH(DATEADD(MONTH, -5, SYSDATETIME())),
        1
    );
    DECLARE @grafica_hasta DATE = EOMONTH(SYSDATETIME());
    -- ============ TOTALES DEL PERÍODO ============
    SELECT 'cosechas' AS kpi, CAST(COUNT(*) AS DECIMAL(18,2)) AS valor
    FROM dbo.Ciclos c
    JOIN dbo.Estados_Ciclo ec ON ec.estado_ciclo_id = c.estado_ciclo_id
    WHERE ec.codigo = 'COSECHADO'
      AND c.fecha_cosecha_real BETWEEN @fecha_desde AND @fecha_hasta
    UNION ALL
    SELECT 'ventas', ISNULL(SUM(v.total), 0)
    FROM dbo.Ventas v
    JOIN dbo.Estados_Pago ep ON ep.estado_pago_id = v.estado_pago_id
    WHERE ep.permite_entrega = 1
      AND CAST(v.fecha_pedido AS DATE) BETWEEN @fecha_desde AND @fecha_hasta
    UNION ALL
    SELECT 'consumos', ISNULL(SUM(cv.cantidad * tr.costo_unitario), 0)
    FROM dbo.Consumos co
    JOIN dbo.Consumo_Version cv ON cv.consumo_id = co.consumo_id AND cv.es_actual = 1
    JOIN dbo.Tipos_Recurso  tr ON tr.tipo_recurso_id = co.tipo_recurso_id
    WHERE co.activo = 1
      AND CAST(cv.fecha_consumo AS DATE) BETWEEN @fecha_desde AND @fecha_hasta;
    -- ============ TENDENCIA (ÚLTIMOS 6 MESES) ============
    SELECT 'cosechas'                              AS kpi,
           FORMAT(c.fecha_cosecha_real, 'yyyy-MM') AS periodo,
           CAST(COUNT(*) AS DECIMAL(18,2))         AS valor
    FROM dbo.Ciclos c
    JOIN dbo.Estados_Ciclo ec ON ec.estado_ciclo_id = c.estado_ciclo_id
    WHERE ec.codigo = 'COSECHADO'
      AND c.fecha_cosecha_real BETWEEN @grafica_desde AND @grafica_hasta
    GROUP BY FORMAT(c.fecha_cosecha_real, 'yyyy-MM')
    UNION ALL
    SELECT 'ventas',
           FORMAT(v.fecha_pedido, 'yyyy-MM'),
           ISNULL(SUM(v.total), 0)
    FROM dbo.Ventas v
    JOIN dbo.Estados_Pago ep ON ep.estado_pago_id = v.estado_pago_id
    WHERE ep.permite_entrega = 1
      AND CAST(v.fecha_pedido AS DATE) BETWEEN @grafica_desde AND @grafica_hasta
    GROUP BY FORMAT(v.fecha_pedido, 'yyyy-MM')
    UNION ALL
    SELECT 'consumos',
           FORMAT(cv.fecha_consumo, 'yyyy-MM'),
           ISNULL(SUM(cv.cantidad * tr.costo_unitario), 0)
    FROM dbo.Consumos co
    JOIN dbo.Consumo_Version cv ON cv.consumo_id = co.consumo_id AND cv.es_actual = 1
    JOIN dbo.Tipos_Recurso  tr ON tr.tipo_recurso_id = co.tipo_recurso_id
    WHERE co.activo = 1
      AND CAST(cv.fecha_consumo AS DATE) BETWEEN @grafica_desde AND @grafica_hasta
    GROUP BY FORMAT(cv.fecha_consumo, 'yyyy-MM')
    ORDER BY kpi, periodo;
END