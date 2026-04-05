CREATE TABLE [dbo].[Estados_Ciclo] (
    [estado_ciclo_id] INT            IDENTITY (1, 1) NOT NULL,
    [codigo]          NVARCHAR (30)  NOT NULL,
    [nombre]          NVARCHAR (50)  NOT NULL,
    [orden]           INT            NULL,
    [color]           NVARCHAR (20)  NULL,
    [es_activo]       BIT            CONSTRAINT [DF_Estados_Ciclo_ActivoFlag] DEFAULT ((1)) NOT NULL,
    [descripcion]     NVARCHAR (MAX) NULL,
    [activo]          BIT            CONSTRAINT [DF_Estados_Ciclo_Activo] DEFAULT ((1)) NOT NULL,
    CONSTRAINT [PK_Estados_Ciclo] PRIMARY KEY CLUSTERED ([estado_ciclo_id] ASC),
    CONSTRAINT [UQ_Estados_Ciclo_Codigo] UNIQUE NONCLUSTERED ([codigo] ASC)
);

