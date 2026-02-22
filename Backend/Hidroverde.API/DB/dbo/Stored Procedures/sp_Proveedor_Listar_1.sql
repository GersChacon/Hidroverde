CREATE   PROCEDURE dbo.sp_Proveedor_Listar
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        proveedor_id,
        nombre,
        descripcion,
        correo,
        telefono,
        activo,
        fecha_creacion
    FROM dbo.Proveedores
    WHERE activo = 1
    ORDER BY nombre;
END