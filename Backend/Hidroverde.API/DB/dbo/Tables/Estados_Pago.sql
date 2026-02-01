CREATE TABLE [dbo].[Estados_Pago] (
    [estado_pago_id]  INT            IDENTITY (1, 1) NOT NULL,
    [codigo]          NVARCHAR (30)  NOT NULL,
    [nombre]          NVARCHAR (50)  NOT NULL,
    [permite_entrega] BIT            CONSTRAINT [DF_Estados_Pago_Ent] DEFAULT ((0)) NOT NULL,
    [color]           NVARCHAR (20)  NULL,
    [descripcion]     NVARCHAR (MAX) NULL,
    [activo]          BIT            CONSTRAINT [DF_Estados_Pago_Activo] DEFAULT ((1)) NOT NULL,
    CONSTRAINT [PK_Estados_Pago] PRIMARY KEY CLUSTERED ([estado_pago_id] ASC),
    CONSTRAINT [UQ_Estados_Pago_Codigo] UNIQUE NONCLUSTERED ([codigo] ASC)
);

