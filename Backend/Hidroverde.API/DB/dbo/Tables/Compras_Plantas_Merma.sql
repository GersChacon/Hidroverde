CREATE TABLE [dbo].[Compras_Plantas_Merma] (
    [merma_id]          INT             IDENTITY (1, 1) NOT NULL,
    [compra_detalle_id] INT             NOT NULL,
    [empleado_id]       INT             NOT NULL,
    [cantidad_merma]    DECIMAL (18, 2) NOT NULL,
    [motivo]            NVARCHAR (300)  NULL,
    [fecha_registro]    DATETIME2 (0)   CONSTRAINT [DF_Compras_Plantas_Merma_fecha_registro] DEFAULT (sysdatetime()) NOT NULL,
    [fecha_creacion]    DATETIME2 (0)   CONSTRAINT [DF_Compras_Plantas_Merma_fecha_creacion] DEFAULT (sysdatetime()) NOT NULL,
    CONSTRAINT [PK_Compras_Plantas_Merma] PRIMARY KEY CLUSTERED ([merma_id] ASC),
    CONSTRAINT [CK_Compras_Plantas_Merma_cantidad_merma] CHECK ([cantidad_merma]>(0)),
    CONSTRAINT [FK_Compras_Plantas_Merma_Compras_Plantas_Detalle] FOREIGN KEY ([compra_detalle_id]) REFERENCES [dbo].[Compras_Plantas_Detalle] ([compra_detalle_id]),
    CONSTRAINT [FK_Compras_Plantas_Merma_Empleados] FOREIGN KEY ([empleado_id]) REFERENCES [dbo].[Empleados] ([empleado_id])
);

