CREATE   PROCEDURE [dbo].[sp_Ciclos_ListarActivos]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.ciclo_id               AS CicloId,
        c.producto_id            AS ProductoId,
        c.torre_id               AS TorreId,
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
    LEFT JOIN dbo.Empleados e ON e.empleado_id = c.responsable_id
    WHERE ec.es_activo = 1
    ORDER BY c.fecha_siembra DESC, c.ciclo_id DESC;
END