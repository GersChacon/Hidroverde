CREATE TABLE [dbo].[Movimientos_Inventario] (
    [movimiento_id]        INT            IDENTITY (1, 1) NOT NULL,
    [inventario_id]        INT            NULL,
    [producto_id]          INT            NOT NULL,
    [tipo_movimiento_id]   INT            NOT NULL,
    [ubicacion_origen_id]  INT            NULL,
    [ubicacion_destino_id] INT            NULL,
    [cantidad]             INT            NOT NULL,
    [motivo]               NVARCHAR (MAX) NULL,
    [usuario_id]           INT            NOT NULL,
    [fecha_movimiento]     DATETIME2 (0)  CONSTRAINT [DF_MovInv_Fecha] DEFAULT (sysdatetime()) NOT NULL,
    CONSTRAINT [PK_Movimientos_Inventario] PRIMARY KEY CLUSTERED ([movimiento_id] ASC),
    CONSTRAINT [CK_MovInv_Cantidad] CHECK ([cantidad]>(0)),
    CONSTRAINT [FK_MovInv_Inventario] FOREIGN KEY ([inventario_id]) REFERENCES [dbo].[Inventario_Actual] ([inventario_id]),
    CONSTRAINT [FK_MovInv_Producto] FOREIGN KEY ([producto_id]) REFERENCES [dbo].[Productos] ([producto_id]),
    CONSTRAINT [FK_MovInv_Tipo] FOREIGN KEY ([tipo_movimiento_id]) REFERENCES [dbo].[Tipos_Movimiento] ([tipo_movimiento_id]),
    CONSTRAINT [FK_MovInv_UbiDes] FOREIGN KEY ([ubicacion_destino_id]) REFERENCES [dbo].[Ubicaciones] ([ubicacion_id]),
    CONSTRAINT [FK_MovInv_UbiOri] FOREIGN KEY ([ubicacion_origen_id]) REFERENCES [dbo].[Ubicaciones] ([ubicacion_id]),
    CONSTRAINT [FK_MovInv_Usuario] FOREIGN KEY ([usuario_id]) REFERENCES [dbo].[Empleados] ([empleado_id])
);


GO
CREATE NONCLUSTERED INDEX [IX_MovInv_TipoId]
    ON [dbo].[Movimientos_Inventario]([tipo_movimiento_id] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_MovInv_ProductoId]
    ON [dbo].[Movimientos_Inventario]([producto_id] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_MovInv_Fecha]
    ON [dbo].[Movimientos_Inventario]([fecha_movimiento] ASC);

