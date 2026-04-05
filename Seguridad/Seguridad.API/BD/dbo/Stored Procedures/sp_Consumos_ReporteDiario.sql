CREATE   PROCEDURE [dbo].[sp_Consumos_ReporteDiario]
    @ciclo_id INT = NULL,
    @fecha_desde DATE = NULL,
    @fecha_hasta DATE = NULL,
    @tipo_recurso_id INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH base AS (
        SELECT
            co.ciclo_id,
            co.tipo_recurso_id,
            tr.codigo,
            tr.nombre AS recurso_nombre,
            tr.unidad,
            CAST(v.fecha_consumo AS DATE) AS fecha_dia,
            v.cantidad
        FROM dbo.Consumos co
        JOIN dbo.Tipos_Recurso tr ON tr.tipo_recurso_id = co.tipo_recurso_id
        JOIN dbo.Consumo_Version v ON v.consumo_id = co.consumo_id AND v.es_actual = 1
        WHERE co.activo = 1
          AND (@ciclo_id IS NULL OR co.ciclo_id = @ciclo_id)
          AND (@tipo_recurso_id IS NULL OR co.tipo_recurso_id = @tipo_recurso_id)
          AND (@fecha_desde IS NULL OR CAST(v.fecha_consumo AS DATE) >= @fecha_desde)
          AND (@fecha_hasta IS NULL OR CAST(v.fecha_consumo AS DATE) <= @fecha_hasta)
    )
    SELECT
        fecha_dia        AS Fecha,
        ciclo_id         AS CicloId,
        tipo_recurso_id  AS TipoRecursoId,
        codigo           AS Codigo,
        recurso_nombre   AS RecursoNombre,
        unidad           AS Unidad,
        SUM(cantidad)    AS TotalCantidad
    FROM base
    GROUP BY
        fecha_dia, ciclo_id, tipo_recurso_id, codigo, recurso_nombre, unidad
    ORDER BY
        fecha_dia ASC, tipo_recurso_id ASC;
END