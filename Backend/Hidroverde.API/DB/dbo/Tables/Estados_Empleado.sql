CREATE TABLE [dbo].[Estados_Empleado] (
    [estado_empleado_id] INT            IDENTITY (1, 1) NOT NULL,
    [codigo]             NVARCHAR (30)  NOT NULL,
    [nombre]             NVARCHAR (50)  NOT NULL,
    [permite_trabajar]   BIT            CONSTRAINT [DF_Estados_Empleado_Trab] DEFAULT ((1)) NOT NULL,
    [descripcion]        NVARCHAR (MAX) NULL,
    [activo]             BIT            CONSTRAINT [DF_Estados_Empleado_Activo] DEFAULT ((1)) NOT NULL,
    CONSTRAINT [PK_Estados_Empleado] PRIMARY KEY CLUSTERED ([estado_empleado_id] ASC),
    CONSTRAINT [UQ_Estados_Empleado_Codigo] UNIQUE NONCLUSTERED ([codigo] ASC)
);

