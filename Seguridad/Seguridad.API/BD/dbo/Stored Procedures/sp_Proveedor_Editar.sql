CREATE   PROCEDURE dbo.sp_Proveedor_Editar
    @proveedor_id INT,
    @nombre       NVARCHAR(150),
    @descripcion  NVARCHAR(500) = NULL,
    @correo       NVARCHAR(254) = NULL,
    @telefono     NVARCHAR(30)  = NULL,
    @activo       BIT = 1
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.Proveedores WHERE proveedor_id = @proveedor_id)
        THROW 50020, 'Proveedor no existe.', 1;

    IF (LTRIM(RTRIM(ISNULL(@nombre,''))) = '')
        THROW 50021, 'El nombre del proveedor es obligatorio.', 1;

    -- Evitar duplicado por nombre (otro proveedor con el mismo nombre)
    IF EXISTS (
        SELECT 1
        FROM dbo.Proveedores
        WHERE nombre = @nombre
          AND proveedor_id <> @proveedor_id
    )
        THROW 50022, 'Ya existe otro proveedor con ese nombre.', 1;

    UPDATE dbo.Proveedores
    SET
        nombre = @nombre,
        descripcion = @descripcion,
        correo = @correo,
        telefono = @telefono,
        activo = @activo
    WHERE proveedor_id = @proveedor_id;
END