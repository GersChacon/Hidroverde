CREATE TABLE [dbo].[Proveedores_Pagos] (
    [pago_id]       INT             IDENTITY (1, 1) NOT NULL,
    [proveedor_id]  INT             NOT NULL,
    [monto_pago]    DECIMAL (18, 2) NOT NULL,
    [saldo_antes]   DECIMAL (18, 2) NOT NULL,
    [saldo_despues] DECIMAL (18, 2) NOT NULL,
    [estado_pago]   NVARCHAR (20)   NOT NULL,
    [fecha_pago]    DATETIME2 (0)   CONSTRAINT [DF_ProvPagos_Fecha] DEFAULT (sysdatetime()) NOT NULL,
    [usuario_id]    INT             NULL,
    [comentario]    NVARCHAR (200)  NULL,
    PRIMARY KEY CLUSTERED ([pago_id] ASC),
    CONSTRAINT [CK_ProvPagos_MontoPositivo] CHECK ([monto_pago]>(0)),
    CONSTRAINT [CK_ProvPagos_SaldosNoNeg] CHECK ([saldo_antes]>=(0) AND [saldo_despues]>=(0)),
    CONSTRAINT [FK_ProvPagos_Proveedor] FOREIGN KEY ([proveedor_id]) REFERENCES [dbo].[Proveedores] ([proveedor_id])
);


GO
CREATE NONCLUSTERED INDEX [IX_ProvPagos_Proveedor_Fecha]
    ON [dbo].[Proveedores_Pagos]([proveedor_id] ASC, [fecha_pago] DESC);

