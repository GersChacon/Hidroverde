
-- EDITAR
CREATE PROCEDURE [dbo].[EditarMetodoPago]
    @metodo_pago_id int,
    @codigo nvarchar(30),
    @nombre nvarchar(50),
    @requiere_confirmacion bit,
    @comision_porcentaje decimal(5, 2),
    @activo bit
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRANSACTION
        UPDATE [dbo].[Metodos_Pago]
        SET [codigo] = @codigo,
            [nombre] = @nombre,
            [requiere_confirmacion] = @requiere_confirmacion,
            [comision_porcentaje] = @comision_porcentaje,
            [activo] = @activo
        WHERE metodo_pago_id = @metodo_pago_id

        SELECT @metodo_pago_id AS metodo_pago_id
    COMMIT TRANSACTION
END