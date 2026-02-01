CREATE TABLE [dbo].[Tipos_Ubicacion] (
    [tipo_ubicacion_id]               INT           IDENTITY (1, 1) NOT NULL,
    [codigo]                          NVARCHAR (30) NOT NULL,
    [nombre]                          NVARCHAR (50) NOT NULL,
    [requiere_temperatura_controlada] BIT           CONSTRAINT [DF_Tipos_Ubicacion_Temp] DEFAULT ((0)) NOT NULL,
    [activo]                          BIT           CONSTRAINT [DF_Tipos_Ubicacion_Activo] DEFAULT ((1)) NOT NULL,
    CONSTRAINT [PK_Tipos_Ubicacion] PRIMARY KEY CLUSTERED ([tipo_ubicacion_id] ASC),
    CONSTRAINT [UQ_Tipos_Ubicacion_Codigo] UNIQUE NONCLUSTERED ([codigo] ASC)
);

