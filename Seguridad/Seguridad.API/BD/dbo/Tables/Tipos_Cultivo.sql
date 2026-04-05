CREATE TABLE [dbo].[Tipos_Cultivo] (
    [tipo_cultivo_id] INT            IDENTITY (1, 1) NOT NULL,
    [codigo]          NVARCHAR (30)  NOT NULL,
    [nombre]          NVARCHAR (50)  NOT NULL,
    [descripcion]     NVARCHAR (MAX) NULL,
    [requisitos]      NVARCHAR (MAX) NULL,
    [activo]          BIT            CONSTRAINT [DF_Tipos_Cultivo_Activo] DEFAULT ((1)) NOT NULL,
    CONSTRAINT [PK_Tipos_Cultivo] PRIMARY KEY CLUSTERED ([tipo_cultivo_id] ASC),
    CONSTRAINT [UQ_Tipos_Cultivo_Codigo] UNIQUE NONCLUSTERED ([codigo] ASC)
);

