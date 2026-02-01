CREATE TABLE [dbo].[Tipos_Cliente] (
    [tipo_cliente_id]   INT            IDENTITY (1, 1) NOT NULL,
    [codigo]            NVARCHAR (30)  NOT NULL,
    [nombre]            NVARCHAR (50)  NOT NULL,
    [descripcion]       NVARCHAR (MAX) NULL,
    [descuento_default] DECIMAL (5, 2) CONSTRAINT [DF_Tipos_Cliente_Desc] DEFAULT ((0.00)) NOT NULL,
    [activo]            BIT            CONSTRAINT [DF_Tipos_Cliente_Activo] DEFAULT ((1)) NOT NULL,
    CONSTRAINT [PK_Tipos_Cliente] PRIMARY KEY CLUSTERED ([tipo_cliente_id] ASC),
    CONSTRAINT [UQ_Tipos_Cliente_Codigo] UNIQUE NONCLUSTERED ([codigo] ASC)
);

