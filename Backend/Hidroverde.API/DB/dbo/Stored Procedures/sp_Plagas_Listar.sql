CREATE     PROCEDURE [dbo].[sp_Plagas_Listar]
    @fecha_desde DATE = NULL,
    @fecha_hasta DATE = NULL,
    @plaga_id INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        r.registro_id,
        r.plaga_id,
        p.nombre AS plaga_nombre,
        r.fecha_hallazgo,
        r.cantidad,
        r.comentario,
        r.empleado_id,
        e.nombre + ' ' + e.apellidos AS empleado_nombre,
        r.fecha_registro
    FROM dbo.Plagas_Registro r
    INNER JOIN dbo.Plagas p ON p.plaga_id = r.plaga_id
    LEFT JOIN dbo.Empleados e ON e.empleado_id = r.empleado_id
    WHERE
        (@fecha_desde IS NULL OR r.fecha_hallazgo >= @fecha_desde)
        AND (@fecha_hasta IS NULL OR r.fecha_hallazgo <= @fecha_hasta)
        AND (@plaga_id IS NULL OR r.plaga_id = @plaga_id)
    ORDER BY r.fecha_hallazgo DESC, r.registro_id DESC;
END