CREATE TABLE [dbo].[Ventas] (
    [venta_id]             INT             IDENTITY (1, 1) NOT NULL,
    [cliente_id]           INT             NOT NULL,
    [direccion_entrega_id] INT             NOT NULL,
    [vendedor_id]          INT             NOT NULL,
    [estado_venta_id]      INT             NOT NULL,
    [estado_pago_id]       INT             NOT NULL,
    [metodo_pago_id]       INT             NULL,
    [tipo_entrega_id]      INT             NOT NULL,
    [numero_factura]       NVARCHAR (100)  NULL,
    [fecha_pedido]         DATETIME2 (0)   CONSTRAINT [DF_Ventas_FechaPedido] DEFAULT (sysdatetime()) NOT NULL,
    [fecha_entrega]        DATETIME2 (0)   NULL,
    [subtotal]             DECIMAL (10, 2) CONSTRAINT [DF_Ventas_Sub] DEFAULT ((0.00)) NOT NULL,
    [iva_monto]            DECIMAL (10, 2) CONSTRAINT [DF_Ventas_IVA] DEFAULT ((0.00)) NOT NULL,
    [total]                DECIMAL (10, 2) CONSTRAINT [DF_Ventas_Total] DEFAULT ((0.00)) NOT NULL,
    [notas]                NVARCHAR (MAX)  NULL,
    [fecha_creacion]       DATETIME2 (0)   CONSTRAINT [DF_Ventas_FechaCreacion] DEFAULT (sysdatetime()) NOT NULL,
    CONSTRAINT [PK_Ventas] PRIMARY KEY CLUSTERED ([venta_id] ASC),
    CONSTRAINT [FK_Ventas_Cliente] FOREIGN KEY ([cliente_id]) REFERENCES [dbo].[Clientes] ([cliente_id]),
    CONSTRAINT [FK_Ventas_Direccion] FOREIGN KEY ([direccion_entrega_id]) REFERENCES [dbo].[Direcciones_Clientes] ([direccion_id]),
    CONSTRAINT [FK_Ventas_EstadoPago] FOREIGN KEY ([estado_pago_id]) REFERENCES [dbo].[Estados_Pago] ([estado_pago_id]),
    CONSTRAINT [FK_Ventas_EstadoVenta] FOREIGN KEY ([estado_venta_id]) REFERENCES [dbo].[Estados_Venta] ([estado_venta_id]),
    CONSTRAINT [FK_Ventas_MetodoPago] FOREIGN KEY ([metodo_pago_id]) REFERENCES [dbo].[Metodos_Pago] ([metodo_pago_id]),
    CONSTRAINT [FK_Ventas_TipoEntrega] FOREIGN KEY ([tipo_entrega_id]) REFERENCES [dbo].[Tipos_Entrega] ([tipo_entrega_id]),
    CONSTRAINT [FK_Ventas_Vendedor] FOREIGN KEY ([vendedor_id]) REFERENCES [dbo].[Empleados] ([empleado_id]),
    CONSTRAINT [UQ_Ventas_Factura] UNIQUE NONCLUSTERED ([numero_factura] ASC)
);


GO
CREATE NONCLUSTERED INDEX [IX_Ventas_VendedorId]
    ON [dbo].[Ventas]([vendedor_id] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Ventas_ClienteId]
    ON [dbo].[Ventas]([cliente_id] ASC);

