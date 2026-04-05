CREATE TABLE [dbo].[Estados_Calidad] (
    [estado_calidad_id] INT            IDENTITY (1, 1) NOT NULL,
    [codigo]            NVARCHAR (30)  NOT NULL,
    [nombre]            NVARCHAR (50)  NOT NULL,
    [permite_venta]     BIT            CONSTRAINT [DF_Estados_Calidad_Venta] DEFAULT ((1)) NOT NULL,
    [requiere_revision] BIT            CONSTRAINT [DF_Estados_Calidad_Rev] DEFAULT ((0)) NOT NULL,
    [descripcion]       NVARCHAR (MAX) NULL,
    [activo]            BIT            CONSTRAINT [DF_Estados_Calidad_Activo] DEFAULT ((1)) NOT NULL,
    CONSTRAINT [PK_Estados_Calidad] PRIMARY KEY CLUSTERED ([estado_calidad_id] ASC),
    CONSTRAINT [UQ_Estados_Calidad_Codigo] UNIQUE NONCLUSTERED ([codigo] ASC)
);

