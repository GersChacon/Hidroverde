CREATE   PROCEDURE dbo.sp_Proveedor_Crear
    @nombre      NVARCHAR(150),
    @descripcion NVARCHAR(500) = NULL,
    @correo      NVARCHAR(254) = NULL,
    @telefono    NVARCHAR(30)  = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Validación mínima
    IF (LTRIM(RTRIM(ISNULL(@nombre,''))) = '')
        THROW 50010, 'El nombre del proveedor es obligatorio.', 1;

    -- Evitar duplicados exactos por nombre
    IF EXISTS (SELECT 1 FROM dbo.Proveedores WHERE nombre = @nombre)
        THROW 50011, 'Ya existe un proveedor con ese nombre.', 1;

    INSERT INTO dbo.Proveedores (nombre, descripcion, correo, telefono)
    VALUES (@nombre, @descripcion, @correo, @telefono);

    SELECT SCOPE_IDENTITY() AS proveedor_id;
END