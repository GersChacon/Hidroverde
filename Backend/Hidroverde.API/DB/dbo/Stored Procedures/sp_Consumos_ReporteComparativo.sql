CREATE   PROCEDURE [dbo].[sp_Consumos_ReporteComparativo]
    @ciclo_id INT,
    @fecha_desde DATETIME2(0) = NULL,
    @fecha_hasta DATETIME2(0) = NULL,
    @granularidad NVARCHAR(10) = N'DIA' -- DIA | MES
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH Base AS (
        SELECT
            co.ciclo_id,
            tr.nombre AS recurso_nombre,
            tr.unidad,
            v.cantidad,
            v.fecha_consumo
        FROM dbo.Consumos co
        JOIN dbo.Tipos_Recurso tr ON tr.tipo_recurso_id = co.tipo_recurso_id
        JOIN dbo.Consumo_Version v ON v.consumo_id = co.consumo_id AND v.es_actual=1
        WHERE co.activo=1
          AND co.ciclo_id=@ciclo_id
          AND (@fecha_desde IS NULL OR v.fecha_consumo >= @fecha_desde)
          AND (@fecha_hasta IS NULL OR v.fecha_consumo <= @fecha_hasta)
    )
    SELECT
        CASE WHEN @granularidad=N'MES'
             THEN DATEFROMPARTS(YEAR(fecha_consumo), MONTH(fecha_consumo), 1)
             ELSE CAST(fecha_consumo AS DATE)
        END AS periodo,
        recurso_nombre,
        unidad,
        SUM(cantidad) AS total_cantidad
    FROM Base
    GROUP BY
        CASE WHEN @granularidad=N'MES'
             THEN DATEFROMPARTS(YEAR(fecha_consumo), MONTH(fecha_consumo), 1)
             ELSE CAST(fecha_consumo AS DATE)
        END,
        recurso_nombre,
        unidad
    ORDER BY periodo ASC, recurso_nombre;
END