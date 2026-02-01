CREATE   PROCEDURE [notif].[sp_Alertas_ListarActivas]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        a.alerta_id,
        a.tipo_alerta,
        a.estado,
        a.fecha_creacion,
        a.mensaje,
        a.producto_id,
        p.nombre_producto,
        a.snapshot_disponible,
        a.snapshot_minimo
    FROM notif.Alerta a
    JOIN dbo.Productos p
        ON p.producto_id = a.producto_id
    WHERE a.estado = 'ACTIVA'
    ORDER BY a.fecha_creacion DESC, a.alerta_id DESC;
END