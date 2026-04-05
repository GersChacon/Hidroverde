CREATE TABLE [dbo].[Tipos_Entrega] (
    [tipo_entrega_id] INT             IDENTITY (1, 1) NOT NULL,
    [codigo]          NVARCHAR (30)   NOT NULL,
    [nombre]          NVARCHAR (50)   NOT NULL,
    [costo_default]   DECIMAL (10, 2) CONSTRAINT [DF_Tipos_Entrega_Costo] DEFAULT ((0.00)) NOT NULL,
    [descripcion]     NVARCHAR (MAX)  NULL,
    [activo]          BIT             CONSTRAINT [DF_Tipos_Entrega_Activo] DEFAULT ((1)) NOT NULL,
    CONSTRAINT [PK_Tipos_Entrega] PRIMARY KEY CLUSTERED ([tipo_entrega_id] ASC),
    CONSTRAINT [UQ_Tipos_Entrega_Codigo] UNIQUE NONCLUSTERED ([codigo] ASC)
);

