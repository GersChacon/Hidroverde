CREATE TABLE [dbo].[Productos] (
    [producto_id]            INT             IDENTITY (1, 1) NOT NULL,
    [codigo]                 NVARCHAR (30)   NOT NULL,
    [variedad_id]            INT             NOT NULL,
    [unidad_id]              INT             NOT NULL,
    [nombre_producto]        NVARCHAR (200)  NOT NULL,
    [descripcion]            NVARCHAR (MAX)  NULL,
    [precio_base]            DECIMAL (10, 2) NOT NULL,
    [dias_caducidad]         INT             NOT NULL,
    [requiere_refrigeracion] BIT             CONSTRAINT [DF_Productos_Refrig] DEFAULT ((0)) NOT NULL,
    [imagen_url]             NVARCHAR (500)  NULL,
    [activo]                 BIT             CONSTRAINT [DF_Productos_Activo] DEFAULT ((1)) NOT NULL,
    [fecha_creacion]         DATETIME2 (0)   CONSTRAINT [DF_Productos_FechaCreacion] DEFAULT (sysdatetime()) NOT NULL,
    [stock_minimo]           INT             NULL,
    [peso_gramos]            DECIMAL (8, 2)  NOT NULL,
    CONSTRAINT [PK_Productos] PRIMARY KEY CLUSTERED ([producto_id] ASC),
    CONSTRAINT [CK_Productos_StockMinimo_NonNegative] CHECK ([stock_minimo] IS NULL OR [stock_minimo]>=(0)),
    CONSTRAINT [FK_Productos_Unidad] FOREIGN KEY ([unidad_id]) REFERENCES [dbo].[Unidades_Medida] ([unidad_id]),
    CONSTRAINT [FK_Productos_Variedad] FOREIGN KEY ([variedad_id]) REFERENCES [dbo].[Variedades] ([variedad_id]),
    CONSTRAINT [UQ_Productos_Codigo] UNIQUE NONCLUSTERED ([codigo] ASC)
);


GO
CREATE NONCLUSTERED INDEX [IX_Productos_UnidadId]
    ON [dbo].[Productos]([unidad_id] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Productos_VariedadId]
    ON [dbo].[Productos]([variedad_id] ASC);

