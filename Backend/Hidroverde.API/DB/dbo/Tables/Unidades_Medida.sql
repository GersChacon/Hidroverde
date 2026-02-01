CREATE TABLE [dbo].[Unidades_Medida] (
    [unidad_id] INT           IDENTITY (1, 1) NOT NULL,
    [codigo]    NVARCHAR (20) NOT NULL,
    [nombre]    NVARCHAR (50) NOT NULL,
    [simbolo]   NVARCHAR (10) NULL,
    [tipo]      NVARCHAR (30) NULL,
    [activo]    BIT           CONSTRAINT [DF_Unidades_Medida_Activo] DEFAULT ((1)) NOT NULL,
    CONSTRAINT [PK_Unidades_Medida] PRIMARY KEY CLUSTERED ([unidad_id] ASC),
    CONSTRAINT [UQ_Unidades_Medida_Codigo] UNIQUE NONCLUSTERED ([codigo] ASC)
);

