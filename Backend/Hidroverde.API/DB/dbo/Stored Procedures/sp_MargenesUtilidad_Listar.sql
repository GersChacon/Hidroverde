CREATE PROCEDURE [dbo].[sp_MargenesUtilidad_Listar]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.producto_id,
        p.nombre_producto,
        pr.proveedor_id,
        pr.nombre AS proveedor_nombre,

        SUM(d.cantidad_comprada) AS cantidad_comprada,
        ISNULL(SUM(m.cantidad_merma), 0) AS cantidad_merma,

        (SUM(d.cantidad_comprada) - ISNULL(SUM(m.cantidad_merma),0)) AS cantidad_util,

        SUM(d.costo_total_linea) AS costo_total,

        /* Costo unitario inicial */
        CASE 
            WHEN SUM(d.cantidad_comprada) > 0 
            THEN SUM(d.costo_total_linea) / SUM(d.cantidad_comprada)
            ELSE 0 
        END AS costo_unitario_inicial,

        /* Costo unitario ajustado por merma */
        CASE 
            WHEN (SUM(d.cantidad_comprada) - ISNULL(SUM(m.cantidad_merma),0)) > 0
            THEN SUM(d.costo_total_linea) / 
                 (SUM(d.cantidad_comprada) - ISNULL(SUM(m.cantidad_merma),0))
            ELSE 0
        END AS costo_unitario_real,

        p.precio_base,

        /* Margen unitario */
        CASE 
            WHEN (SUM(d.cantidad_comprada) - ISNULL(SUM(m.cantidad_merma),0)) > 0
            THEN p.precio_base - 
                 (SUM(d.costo_total_linea) / 
                 (SUM(d.cantidad_comprada) - ISNULL(SUM(m.cantidad_merma),0)))
            ELSE 0
        END AS margen_unitario,

        /* Margen porcentual */
        CASE 
            WHEN p.precio_base > 0 AND 
                 (SUM(d.cantidad_comprada) - ISNULL(SUM(m.cantidad_merma),0)) > 0
            THEN 
                (
                    (p.precio_base - 
                    (SUM(d.costo_total_linea) / 
                    (SUM(d.cantidad_comprada) - ISNULL(SUM(m.cantidad_merma),0))))
                    / p.precio_base
                ) * 100
            ELSE 0
        END AS margen_porcentaje

    FROM dbo.Compras_Plantas_Detalle d
    INNER JOIN dbo.Compras_Plantas c
        ON d.compra_id = c.compra_id
    INNER JOIN dbo.Productos p
        ON d.producto_id = p.producto_id
    INNER JOIN dbo.Proveedores pr
        ON c.proveedor_id = pr.proveedor_id
    LEFT JOIN dbo.Compras_Plantas_Merma m
        ON d.compra_detalle_id = m.compra_detalle_id

    WHERE c.activo = 1

    GROUP BY 
        p.producto_id,
        p.nombre_producto,
        pr.proveedor_id,
        pr.nombre,
        p.precio_base

    ORDER BY margen_porcentaje DESC;
END