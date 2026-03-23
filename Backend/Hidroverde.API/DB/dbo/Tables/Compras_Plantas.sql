CREATE TABLE [dbo].[Compras_Plantas] (
    [compra_id]      INT             IDENTITY (1, 1) NOT NULL,
    [proveedor_id]   INT             NOT NULL,
    [empleado_id]    INT             NOT NULL,
    [numero_factura] NVARCHAR (50)   NULL,
    [fecha_compra]   DATETIME2 (0)   CONSTRAINT [DF_Compras_Plantas_fecha_compra] DEFAULT (sysdatetime()) NOT NULL,
    [total_factura]  DECIMAL (18, 2) NOT NULL,
    [observaciones]  NVARCHAR (500)  NULL,
    [activo]         BIT             CONSTRAINT [DF_Compras_Plantas_activo] DEFAULT ((1)) NOT NULL,
    [fecha_creacion] DATETIME2 (0)   CONSTRAINT [DF_Compras_Plantas_fecha_creacion] DEFAULT (sysdatetime()) NOT NULL,
    CONSTRAINT [PK_Compras_Plantas] PRIMARY KEY CLUSTERED ([compra_id] ASC),
    CONSTRAINT [CK_Compras_Plantas_total_factura] CHECK ([total_factura]>(0)),
    CONSTRAINT [FK_Compras_Plantas_Empleados] FOREIGN KEY ([empleado_id]) REFERENCES [dbo].[Empleados] ([empleado_id]),
    CONSTRAINT [FK_Compras_Plantas_Proveedores] FOREIGN KEY ([proveedor_id]) REFERENCES [dbo].[Proveedores] ([proveedor_id])
);

