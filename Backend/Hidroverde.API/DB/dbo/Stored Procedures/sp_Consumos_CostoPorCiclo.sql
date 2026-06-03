CREATE PROCEDURE [dbo].[sp_Consumos_CostoPorCiclo]
    @ciclo_id     INT,
    @fecha_desde  DATETIME2(0) = NULL,
    @fecha_hasta  DATETIME2(0) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Resultset 1: total del ciclo (costo = cantidad de la versión vigente * costo unitario del recurso)
    SELECT
        @ciclo_id                                       AS CicloId,
        ISNULL(SUM(cv.cantidad * tr.costo_unitario), 0) AS CostoTotal,
        COUNT(*)                                        AS CantidadConsumos
    FROM dbo.Consumos co
    JOIN dbo.Consumo_Version cv ON cv.consumo_id = co.consumo_id AND cv.es_actual = 1
    JOIN dbo.Tipos_Recurso  tr ON tr.tipo_recurso_id = co.tipo_recurso_id
    WHERE co.activo = 1
      AND co.ciclo_id = @ciclo_id
      AND (@fecha_desde IS NULL OR cv.fecha_consumo >= @fecha_desde)
      AND (@fecha_hasta IS NULL OR cv.fecha_consumo <= @fecha_hasta);

    -- Resultset 2: desglose por tipo de recurso
    SELECT
        tr.tipo_recurso_id              AS TipoRecursoId,
        tr.nombre                       AS RecursoNombre,
        tr.unidad                       AS Unidad,
        tr.costo_unitario               AS CostoUnitario,
        SUM(cv.cantidad)                AS Cantidad,
        SUM(cv.cantidad * tr.costo_unitario) AS Costo
    FROM dbo.Consumos co
    JOIN dbo.Consumo_Version cv ON cv.consumo_id = co.consumo_id AND cv.es_actual = 1
    JOIN dbo.Tipos_Recurso  tr ON tr.tipo_recurso_id = co.tipo_recurso_id
    WHERE co.activo = 1
      AND co.ciclo_id = @ciclo_id
      AND (@fecha_desde IS NULL OR cv.fecha_consumo >= @fecha_desde)
      AND (@fecha_hasta IS NULL OR cv.fecha_consumo <= @fecha_hasta)
    GROUP BY tr.tipo_recurso_id, tr.nombre, tr.unidad, tr.costo_unitario
    ORDER BY Costo DESC;
END