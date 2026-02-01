CREATE TABLE [dbo].[Ciclos] (
    [ciclo_id]               INT            IDENTITY (1, 1) NOT NULL,
    [producto_id]            INT            NOT NULL,
    [variedad_id]            INT            NOT NULL,
    [torre_id]               INT            NOT NULL,
    [estado_ciclo_id]        INT            NOT NULL,
    [fecha_siembra]          DATE           NOT NULL,
    [fecha_cosecha_estimada] DATE           NULL,
    [fecha_cosecha_real]     DATE           NULL,
    [cantidad_plantas]       INT            NOT NULL,
    [responsable_id]         INT            NOT NULL,
    [lote_semilla]           NVARCHAR (100) NULL,
    [notas]                  NVARCHAR (MAX) NULL,
    [fecha_creacion]         DATETIME2 (0)  CONSTRAINT [DF_Ciclos_FechaCreacion] DEFAULT (sysdatetime()) NOT NULL,
    CONSTRAINT [PK_Ciclos] PRIMARY KEY CLUSTERED ([ciclo_id] ASC),
    CONSTRAINT [CK_Ciclos_Cantidad] CHECK ([cantidad_plantas]>(0)),
    CONSTRAINT [FK_Ciclos_Estado] FOREIGN KEY ([estado_ciclo_id]) REFERENCES [dbo].[Estados_Ciclo] ([estado_ciclo_id]),
    CONSTRAINT [FK_Ciclos_Producto] FOREIGN KEY ([producto_id]) REFERENCES [dbo].[Productos] ([producto_id]),
    CONSTRAINT [FK_Ciclos_Resp] FOREIGN KEY ([responsable_id]) REFERENCES [dbo].[Empleados] ([empleado_id]),
    CONSTRAINT [FK_Ciclos_Torre] FOREIGN KEY ([torre_id]) REFERENCES [dbo].[Torres] ([torre_id]),
    CONSTRAINT [FK_Ciclos_Variedad] FOREIGN KEY ([variedad_id]) REFERENCES [dbo].[Variedades] ([variedad_id])
);


GO
CREATE NONCLUSTERED INDEX [IX_Ciclos_TorreId]
    ON [dbo].[Ciclos]([torre_id] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Ciclos_FechaCosechaEst]
    ON [dbo].[Ciclos]([fecha_cosecha_estimada] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Ciclos_EstadoId]
    ON [dbo].[Ciclos]([estado_ciclo_id] ASC);

