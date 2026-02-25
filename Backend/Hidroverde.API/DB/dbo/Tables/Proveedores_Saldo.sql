CREATE TABLE [dbo].[Proveedores_Saldo] (
    [proveedor_id]        INT             NOT NULL,
    [total_compras]       DECIMAL (18, 2) CONSTRAINT [DF_ProvSaldo_totalcompras] DEFAULT ((0)) NOT NULL,
    [total_pagado]        DECIMAL (18, 2) CONSTRAINT [DF_ProvSaldo_totalpagado] DEFAULT ((0)) NOT NULL,
    [fecha_actualizacion] DATETIME2 (0)   CONSTRAINT [DF_ProvSaldo_fecha] DEFAULT (sysdatetime()) NOT NULL,
    PRIMARY KEY CLUSTERED ([proveedor_id] ASC),
    CONSTRAINT [CK_ProvSaldo_no_negativos] CHECK ([total_compras]>=(0) AND [total_pagado]>=(0)),
    CONSTRAINT [CK_ProvSaldo_no_sobrepago] CHECK ([total_pagado]<=[total_compras]),
    CONSTRAINT [FK_ProvSaldo_Proveedor] FOREIGN KEY ([proveedor_id]) REFERENCES [dbo].[Proveedores] ([proveedor_id])
);

