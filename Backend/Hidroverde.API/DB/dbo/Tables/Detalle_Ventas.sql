CREATE TABLE [dbo].[Detalle_Ventas] (
    [detalle_id]         INT             IDENTITY (1, 1) NOT NULL,
    [venta_id]           INT             NOT NULL,
    [inventario_id]      INT             NOT NULL,
    [producto_id]        INT             NOT NULL,
    [cantidad]           INT             NOT NULL,
    [precio_unitario]    DECIMAL (10, 2) NOT NULL,
    [descuento_unitario] DECIMAL (10, 2) CONSTRAINT [DF_Detalle_Desc] DEFAULT ((0.00)) NOT NULL,
    [subtotal]           AS              ([cantidad]*([precio_unitario]-[descuento_unitario])),
    [notas]              NVARCHAR (MAX)  NULL,
    CONSTRAINT [PK_Detalle_Ventas] PRIMARY KEY CLUSTERED ([detalle_id] ASC),
    CONSTRAINT [CK_Detalle_Cantidad] CHECK ([cantidad]>(0)),
    CONSTRAINT [FK_Detalle_Inventario] FOREIGN KEY ([inventario_id]) REFERENCES [dbo].[Inventario_Actual] ([inventario_id]),
    CONSTRAINT [FK_Detalle_Producto] FOREIGN KEY ([producto_id]) REFERENCES [dbo].[Productos] ([producto_id]),
    CONSTRAINT [FK_Detalle_Venta] FOREIGN KEY ([venta_id]) REFERENCES [dbo].[Ventas] ([venta_id]) ON DELETE CASCADE
);


GO
CREATE NONCLUSTERED INDEX [IX_Detalle_VentaId]
    ON [dbo].[Detalle_Ventas]([venta_id] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Detalle_InventarioId]
    ON [dbo].[Detalle_Ventas]([inventario_id] ASC);

