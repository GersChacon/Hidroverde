CREATE TABLE [dbo].[Compras_Plantas_Detalle] (
    [compra_detalle_id]        INT             IDENTITY (1, 1) NOT NULL,
    [compra_id]                INT             NOT NULL,
    [producto_id]              INT             NOT NULL,
    [unidad_id]                INT             NOT NULL,
    [cantidad_comprada]        DECIMAL (18, 2) NOT NULL,
    [costo_total_linea]        DECIMAL (18, 2) NOT NULL,
    [costo_unitario_calculado] DECIMAL (18, 4) NOT NULL,
    [observaciones]            NVARCHAR (500)  NULL,
    [fecha_creacion]           DATETIME2 (0)   CONSTRAINT [DF_Compras_Plantas_Detalle_fecha_creacion] DEFAULT (sysdatetime()) NOT NULL,
    CONSTRAINT [PK_Compras_Plantas_Detalle] PRIMARY KEY CLUSTERED ([compra_detalle_id] ASC),
    CONSTRAINT [CK_Compras_Plantas_Detalle_cantidad_comprada] CHECK ([cantidad_comprada]>(0)),
    CONSTRAINT [CK_Compras_Plantas_Detalle_costo_total_linea] CHECK ([costo_total_linea]>(0)),
    CONSTRAINT [CK_Compras_Plantas_Detalle_costo_unitario_calculado] CHECK ([costo_unitario_calculado]>(0)),
    CONSTRAINT [FK_Compras_Plantas_Detalle_Compras_Plantas] FOREIGN KEY ([compra_id]) REFERENCES [dbo].[Compras_Plantas] ([compra_id]),
    CONSTRAINT [FK_Compras_Plantas_Detalle_Productos] FOREIGN KEY ([producto_id]) REFERENCES [dbo].[Productos] ([producto_id]),
    CONSTRAINT [FK_Compras_Plantas_Detalle_Unidades_Medida] FOREIGN KEY ([unidad_id]) REFERENCES [dbo].[Unidades_Medida] ([unidad_id])
);

