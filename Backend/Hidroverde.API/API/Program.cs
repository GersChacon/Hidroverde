using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using DA;
using DA.Repositorios;
using Flujo;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// ── JSON ────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        opts.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ── CORS ────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:3000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ── DI — Repositorio ────────────────────────────────────
builder.Services.AddScoped<IRepositorioDapper, RepositorioDapper>();

// ── DI — Flujo + DA ─────────────────────────────────────
builder.Services.AddScoped<ITipoCultivoFlujo, TipoCultivoFlujo>();
builder.Services.AddScoped<ITipoCultivoDA, TipoCultivoDA>();
builder.Services.AddScoped<ICategoriaFlujo, CategoriaFlujo>();
builder.Services.AddScoped<ICategoriaDA, CategoriaDA>();
builder.Services.AddScoped<IVariedadFlujo, VariedadFlujo>();
builder.Services.AddScoped<IVariedadDA, VariedadDA>();
builder.Services.AddScoped<IProductoFlujo, ProductoFlujo>();
builder.Services.AddScoped<IProductoDA, ProductoDA>();
builder.Services.AddScoped<IAlertasDA, AlertasDA>();
builder.Services.AddScoped<IAlertasFlujo, AlertasFlujo>();
builder.Services.AddScoped<IEstadoVentaDA, EstadoVentaDA>();
builder.Services.AddScoped<IEstadoVentaFlujo, EstadoVentaFlujo>();
builder.Services.AddScoped<ITipoEntregaDA, TipoEntregaDA>();
builder.Services.AddScoped<ITipoEntregaFlujo, TipoEntregaFlujo>();
builder.Services.AddScoped<ICiclosDA, CiclosDA>();
builder.Services.AddScoped<ICiclosFlujo, CiclosFlujo>();
builder.Services.AddScoped<ITiposRecursoDA, TiposRecursoDA>();
builder.Services.AddScoped<ITiposRecursoFlujo, TiposRecursoFlujo>();
builder.Services.AddScoped<IConsumosDA, ConsumosDA>();
builder.Services.AddScoped<IConsumosFlujo, ConsumosFlujo>();
builder.Services.AddScoped<IInventarioDA, InventarioDA>();
builder.Services.AddScoped<IInventarioFlujo, InventarioFlujo>();
builder.Services.AddScoped<IProveedoresDA, ProveedoresDA>();
builder.Services.AddScoped<IProveedoresFlujo, ProveedoresFlujo>();
builder.Services.AddScoped<IMetodoPagoDA, MetodoPagoDA>();
builder.Services.AddScoped<IMetodoPagoFlujo, MetodoPagoFlujo>();
builder.Services.AddScoped<IRolDA, RolDA>();
builder.Services.AddScoped<IRolFlujo, RolFlujo>();
builder.Services.AddScoped<ITipoClienteDA, TipoClienteDA>();
builder.Services.AddScoped<ITipoClienteFlujo, TipoClienteFlujo>();
builder.Services.AddScoped<IEstadoPagoDA, EstadoPagoDA>();
builder.Services.AddScoped<IEstadoPagoFlujo, EstadoPagoFlujo>();
builder.Services.AddScoped<IEmpleadoDA, EmpleadoDA>();
builder.Services.AddScoped<IEmpleadoFlujo, EmpleadoFlujo>();
builder.Services.AddScoped<IClienteDA, ClienteDA>();
builder.Services.AddScoped<IClienteFlujo, ClienteFlujo>();
builder.Services.AddScoped<IVentaDA, VentaDA>();
builder.Services.AddScoped<IVentaFlujo, VentaFlujo>();
builder.Services.AddScoped<IPlagasDA, PlagasDA>();
builder.Services.AddScoped<IPlagasFlujo, PlagasFlujo>();
builder.Services.AddScoped<ITorresDA, TorresDA>();
builder.Services.AddScoped<ITorresFlujo, TorresFlujo>();
builder.Services.AddScoped<IComprasPlantasDA, ComprasPlantasDA>();
builder.Services.AddScoped<IComprasPlantasFlujo, ComprasPlantasFlujo>();
builder.Services.AddScoped<IKpisDA, KpisDA>();
builder.Services.AddScoped<IKpisFlujo, KpisFlujo>();

Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CORS debe ir antes de Authorization y MapControllers
app.UseCors("AllowFrontend");

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthorization();
app.MapControllers();

app.Run();
