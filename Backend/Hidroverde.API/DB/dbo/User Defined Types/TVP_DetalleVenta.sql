CREATE TYPE [dbo].[TVP_DetalleVenta] AS TABLE (
    [inventario_id]      INT             NOT NULL,
    [producto_id]        INT             NOT NULL,
    [cantidad]           INT             NOT NULL,
    [precio_unitario]    DECIMAL (10, 2) NOT NULL,
    [descuento_unitario] DECIMAL (10, 2) DEFAULT ((0)) NOT NULL,
    [notas]              NVARCHAR (MAX)  NULL);

