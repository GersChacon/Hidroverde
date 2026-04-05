CREATE   PROCEDURE dbo.sp_Proveedor_Crear
  @nombre NVARCHAR(200),
  @descripcion NVARCHAR(500) = NULL,
  @correo NVARCHAR(200) = NULL,
  @telefono NVARCHAR(50) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  IF (NULLIF(LTRIM(RTRIM(@nombre)), '') IS NULL)
    THROW 50300, 'El nombre del proveedor es obligatorio.', 1;

  IF EXISTS (SELECT 1 FROM dbo.Proveedores WHERE nombre = @nombre)
    THROW 50301, 'Ya existe un proveedor con ese nombre.', 1;

  INSERT INTO dbo.Proveedores (nombre, descripcion, correo, telefono, activo)
  VALUES (@nombre, @descripcion, @correo, @telefono, 1);

  SELECT
    proveedor_id AS ProveedorId,
    nombre       AS Nombre,
    descripcion  AS Descripcion,
    correo       AS Correo,
    telefono     AS Telefono,
    activo       AS Activo,
    fecha_creacion AS FechaCreacion
  FROM dbo.Proveedores
  WHERE proveedor_id = SCOPE_IDENTITY();
END