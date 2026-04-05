CREATE TABLE [dbo].[EmpleadoxRol] (
    [empleado_id] INT NOT NULL,
    [rol_id]      INT NOT NULL,
    CONSTRAINT [PK_EmpleadoxRol] PRIMARY KEY CLUSTERED ([empleado_id] ASC, [rol_id] ASC),
    CONSTRAINT [FK_EmpleadoxRol_Empleados] FOREIGN KEY ([empleado_id]) REFERENCES [dbo].[Empleados] ([empleado_id]),
    CONSTRAINT [FK_EmpleadoxRol_Roles] FOREIGN KEY ([rol_id]) REFERENCES [dbo].[Roles] ([rol_id])
);

