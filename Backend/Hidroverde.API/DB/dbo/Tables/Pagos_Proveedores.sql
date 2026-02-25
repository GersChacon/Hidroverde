CREATE TABLE [dbo].[Pagos_Proveedores] (
    [pago_proveedor_id] INT             IDENTITY (1, 1) NOT NULL,
    [proveedor_id]      INT             NOT NULL,
    [fecha]             DATETIME2 (0)   CONSTRAINT [DF_PagosProv_fecha] DEFAULT (sysdatetime()) NOT NULL,
    [total_compras]     DECIMAL (18, 2) NOT NULL,
    [monto_pagado]      DECIMAL (18, 2) NOT NULL,
    [observacion]       NVARCHAR (500)  NULL,
    PRIMARY KEY CLUSTERED ([pago_proveedor_id] ASC),
    CONSTRAINT [CK_PagosProv_no_sobrepago] CHECK ([monto_pagado]<=[total_compras]),
    CONSTRAINT [CK_PagosProv_totales] CHECK ([total_compras]>=(0) AND [monto_pagado]>=(0)),
    CONSTRAINT [FK_PagosProv_Proveedor] FOREIGN KEY ([proveedor_id]) REFERENCES [dbo].[Proveedores] ([proveedor_id])
);

