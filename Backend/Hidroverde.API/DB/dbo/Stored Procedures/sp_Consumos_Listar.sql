CREATE PROCEDURE [dbo].[sp_Consumos_Listar]
    @ciclo_id INT = NULL,
    @fecha_desde DATETIME2(0) = NULL,
    @fecha_hasta DATETIME2(0) = NULL,
    @tipo_recurso_id INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        co.consumo_id                 AS ConsumoId,
        co.ciclo_id                   AS CicloId,
        co.tipo_recurso_id            AS TipoRecursoId,
        tr.codigo                     AS Codigo,
        tr.nombre                     AS RecursoNombre,
        tr.categoria                  AS Categoria,
        tr.unidad                     AS Unidad,
        v.version_no                  AS VersionNo,
        v.cantidad                    AS Cantidad,
        v.fecha_consumo               AS FechaConsumo,
        v.notas                       AS Notas,
        v.fecha_registro              AS FechaRegistro,
        v.registrado_por_empleado_id  AS RegistradoPorEmpleadoId,
        (e.nombre + N' ' + e.apellidos) AS RegistradoPorNombre
    FROM dbo.Consumos co
    JOIN dbo.Tipos_Recurso tr ON tr.tipo_recurso_id = co.tipo_recurso_id
    JOIN dbo.Consumo_Version v ON v.consumo_id = co.consumo_id AND v.es_actual = 1
    LEFT JOIN dbo.Empleados e ON e.empleado_id = v.registrado_por_empleado_id
    WHERE co.activo = 1
      AND (@ciclo_id IS NULL OR co.ciclo_id=@ciclo_id)
      AND (@tipo_recurso_id IS NULL OR co.tipo_recurso_id=@tipo_recurso_id)
      AND (@fecha_desde IS NULL OR v.fecha_consumo >= @fecha_desde)
      AND (@fecha_hasta IS NULL OR v.fecha_consumo <= @fecha_hasta)
    ORDER BY v.fecha_consumo DESC, co.consumo_id DESC;
END