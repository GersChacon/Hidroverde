CREATE TABLE [dbo].[Estados_Venta] (
    [estado_venta_id]      INT            IDENTITY (1, 1) NOT NULL,
    [codigo]               NVARCHAR (30)  NOT NULL,
    [nombre]               NVARCHAR (50)  NOT NULL,
    [orden]                INT            NULL,
    [color]                NVARCHAR (20)  NULL,
    [permite_modificacion] BIT            CONSTRAINT [DF_Estados_Venta_Mod] DEFAULT ((1)) NOT NULL,
    [descripcion]          NVARCHAR (MAX) NULL,
    [activo]               BIT            CONSTRAINT [DF_Estados_Venta_Activo] DEFAULT ((1)) NOT NULL,
    CONSTRAINT [PK_Estados_Venta] PRIMARY KEY CLUSTERED ([estado_venta_id] ASC),
    CONSTRAINT [UQ_Estados_Venta_Codigo] UNIQUE NONCLUSTERED ([codigo] ASC)
);

