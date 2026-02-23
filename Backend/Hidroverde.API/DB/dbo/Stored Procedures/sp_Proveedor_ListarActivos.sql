CREATE   PROCEDURE dbo.sp_Proveedor_ListarActivos
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        proveedor_id AS ProveedorId,
        nombre       AS Nombre
    FROM dbo.Proveedores
    WHERE activo = 1
    ORDER BY nombre;
END