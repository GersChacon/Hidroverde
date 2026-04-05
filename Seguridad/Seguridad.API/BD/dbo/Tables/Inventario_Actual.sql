CREATE TABLE [dbo].[Inventario_Actual] (
    [inventario_id]       INT            IDENTITY (1, 1) NOT NULL,
    [producto_id]         INT            NOT NULL,
    [ubicacion_id]        INT            NOT NULL,
    [estado_calidad_id]   INT            NOT NULL,
    [lote]                NVARCHAR (100) NOT NULL,
    [cantidad_disponible] INT            CONSTRAINT [DF_Inv_Cant] DEFAULT ((0)) NOT NULL,
    [fecha_entrada]       DATE           NOT NULL,
    [fecha_caducidad]     DATE           NOT NULL,
    [ciclo_origen_id]     INT            NULL,
    [notas]               NVARCHAR (MAX) NULL,
    [fecha_creacion]      DATETIME2 (0)  CONSTRAINT [DF_Inv_FechaCreacion] DEFAULT (sysdatetime()) NOT NULL,
    CONSTRAINT [PK_Inventario_Actual] PRIMARY KEY CLUSTERED ([inventario_id] ASC),
    CONSTRAINT [CK_Inv_NoNeg] CHECK ([cantidad_disponible]>=(0)),
    CONSTRAINT [FK_Inv_Calidad] FOREIGN KEY ([estado_calidad_id]) REFERENCES [dbo].[Estados_Calidad] ([estado_calidad_id]),
    CONSTRAINT [FK_Inv_Ciclo] FOREIGN KEY ([ciclo_origen_id]) REFERENCES [dbo].[Ciclos] ([ciclo_id]),
    CONSTRAINT [FK_Inv_Producto] FOREIGN KEY ([producto_id]) REFERENCES [dbo].[Productos] ([producto_id]),
    CONSTRAINT [FK_Inv_Ubicacion] FOREIGN KEY ([ubicacion_id]) REFERENCES [dbo].[Ubicaciones] ([ubicacion_id])
);


GO
CREATE NONCLUSTERED INDEX [IX_Inv_Caducidad]
    ON [dbo].[Inventario_Actual]([fecha_caducidad] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Inv_ProductoId]
    ON [dbo].[Inventario_Actual]([producto_id] ASC);


GO
CREATE UNIQUE NONCLUSTERED INDEX [UX_Inv_CicloOrigen]
    ON [dbo].[Inventario_Actual]([ciclo_origen_id] ASC) WHERE ([ciclo_origen_id] IS NOT NULL);

