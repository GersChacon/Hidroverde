-- AGREGAR
CREATE PROCEDURE [dbo].[AgregarMetodoPago]
    @codigo nvarchar(30),
    @nombre nvarchar(50),
    @requiere_confirmacion bit,
    @comision_porcentaje decimal(5, 2),
    @activo bit = 1
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRANSACTION
        INSERT INTO [dbo].[Metodos_Pago]
            ([codigo], [nombre], [requiere_confirmacion], [comision_porcentaje], [activo])
        VALUES
            (@codigo, @nombre, @requiere_confirmacion, @comision_porcentaje, @activo)

        SELECT SCOPE_IDENTITY() AS metodo_pago_id
    COMMIT TRANSACTION
END