CREATE     PROCEDURE [dbo].[sp_Plagas_Registrar]
    @plaga_id INT,
    @fecha_hallazgo DATE,
    @cantidad INT = 1,
    @comentario NVARCHAR(500) = NULL,
    @empleado_id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF @cantidad IS NULL OR @cantidad < 1
        SET @cantidad = 1;

    IF NOT EXISTS (
        SELECT 1
        FROM dbo.Plagas
        WHERE plaga_id = @plaga_id
          AND activo = 1
    )
    BEGIN
        THROW 51000, 'La plaga no existe o está inactiva.', 1;
    END

    INSERT INTO dbo.Plagas_Registro (plaga_id, fecha_hallazgo, cantidad, comentario, empleado_id)
    VALUES (@plaga_id, @fecha_hallazgo, @cantidad, @comentario, @empleado_id);

    SELECT SCOPE_IDENTITY() AS registro_id;
END