using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Flujo;
using DA;
using DA.Repositorios;

using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        opts.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IRepositorioDapper, RepositorioDapper>();

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
builder.Services.AddScoped<IRepositorioDapper, RepositorioDapper>();

builder.Services.AddScoped<ICiclosDA, CiclosDA>();
builder.Services.AddScoped<ITiposRecursoDA, TiposRecursoDA>();
builder.Services.AddScoped<IConsumosDA, ConsumosDA>();
builder.Services.AddScoped<IConsumosDA, ConsumosDA>();

builder.Services.AddScoped<ICiclosFlujo, CiclosFlujo>();
builder.Services.AddScoped<ITiposRecursoFlujo, TiposRecursoFlujo>();
builder.Services.AddScoped<IConsumosFlujo, ConsumosFlujo>();
builder.Services.AddScoped<IChecklistFlujo, ChecklistFlujo>();
builder.Services.AddScoped<IChecklistDA, ChecklistDA>();
builder.Services.AddScoped<IEvidenceFlujo, EvidenceFlujo>();
builder.Services.AddScoped<IEvidenceDA, EvidenceDA>();
builder.Services.AddScoped<IHistoryFlujo, HistoryFlujo>();
builder.Services.AddScoped<IHistoryDA, HistoryDA>();
builder.Services.AddScoped<IClienteFlujo, ClienteFlujo>();
builder.Services.AddScoped<IClienteDA, ClienteDA>();
builder.Services.AddScoped<IKpiFlujo, KpiFlujo>();
builder.Services.AddScoped<IKpiDA, KpiDA>();
// Después de builder.Services.AddControllers();
builder.Services.AddScoped<IVentaDA, VentaDA>();
builder.Services.AddScoped<IVentaFlujo, VentaFlujo>();
builder.Services.AddScoped<IProveedoresFlujo, ProveedoresFlujo>();
builder.Services.AddScoped<IPlagasDA, PlagasDA>();
builder.Services.AddScoped<IPlagasFlujo, PlagasFlujo>();
builder.Services.AddScoped<ITorresDA, TorresDA>();
builder.Services.AddScoped<ITorresFlujo, TorresFlujo>();


Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true; // <-- aquí
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseDefaultFiles(); // permite que / cargue index.html
app.UseStaticFiles();  // habilita wwwroot

app.UseAuthorization();

app.MapControllers();

app.Run();
