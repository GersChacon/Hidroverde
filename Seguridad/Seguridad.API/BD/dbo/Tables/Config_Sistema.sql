CREATE TABLE [dbo].[Config_Sistema] (
    [config_id]      INT            IDENTITY (1, 1) NOT NULL,
    [clave]          NVARCHAR (100) NOT NULL,
    [valor]          NVARCHAR (500) NOT NULL,
    [tipo]           NVARCHAR (30)  NULL,
    [categoria]      NVARCHAR (50)  NULL,
    [descripcion]    NVARCHAR (500) NULL,
    [requerido]      BIT            CONSTRAINT [DF_Config_Requerido] DEFAULT ((1)) NOT NULL,
    [activo]         BIT            CONSTRAINT [DF_Config_Activo] DEFAULT ((1)) NOT NULL,
    [fecha_creacion] DATETIME2 (0)  CONSTRAINT [DF_Config_FechaCreacion] DEFAULT (sysdatetime()) NOT NULL,
    CONSTRAINT [PK_Config_Sistema] PRIMARY KEY CLUSTERED ([config_id] ASC),
    CONSTRAINT [UQ_Config_Sistema_Clave] UNIQUE NONCLUSTERED ([clave] ASC)
);

