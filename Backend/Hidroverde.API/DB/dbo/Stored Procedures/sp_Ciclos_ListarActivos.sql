
CREATE   PROCEDURE [dbo].[sp_Ciclos_ListarActivos]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.ciclo_id               AS CicloId,

        c.producto_id            AS ProductoId,
        p.codigo                 AS ProductoCodigo,
        p.nombre_producto        AS ProductoNombre,

        c.variedad_id            AS VariedadId,
        v.nombre_variedad        AS VariedadNombre,

        c.torre_id               AS TorreId,
        t.codigo_torre           AS TorreCodigo,

        c.estado_ciclo_id        AS EstadoCicloId,
        ec.nombre                AS EstadoNombre,
        ec.es_activo             AS EsActivo,

        c.fecha_siembra          AS FechaSiembra,
        c.fecha_cosecha_estimada AS FechaCosechaEstimada,
        c.fecha_cosecha_real     AS FechaCosechaReal,

        c.cantidad_plantas       AS CantidadPlantas,

        c.responsable_id         AS ResponsableId,
        (e.nombre + N' ' + e.apellidos) AS ResponsableNombre
    FROM dbo.Ciclos c
    JOIN dbo.Estados_Ciclo ec ON ec.estado_ciclo_id = c.estado_ciclo_id

    LEFT JOIN dbo.Productos  p ON p.producto_id = c.producto_id
    LEFT JOIN dbo.Variedades v ON v.variedad_id = c.variedad_id
    LEFT JOIN dbo.Torres     t ON t.torre_id = c.torre_id

    LEFT JOIN dbo.Empleados e ON e.empleado_id = c.responsable_id
    WHERE ec.es_activo = 1
      AND c.fecha_cosecha_real IS NULL
      AND NOT EXISTS (
          SELECT 1
          FROM dbo.Inventario_Actual ia
          WHERE ia.ciclo_origen_id = c.ciclo_id
      )
    ORDER BY c.fecha_siembra DESC, c.ciclo_id DESC;
END;