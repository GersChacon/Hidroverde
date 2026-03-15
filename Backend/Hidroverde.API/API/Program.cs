using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Interfaces.Servicios;
using DA;
using DA.Repositorios;
using Flujo;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure Dapper
Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;

// Register repositories
builder.Services.AddScoped<IRepositorioDapper, RepositorioDapper>();

// Register DA layer
builder.Services.AddScoped<ITipoCultivoDA, TipoCultivoDA>();
builder.Services.AddScoped<ICategoriaDA, CategoriaDA>();
builder.Services.AddScoped<IVariedadDA, VariedadDA>();
builder.Services.AddScoped<IProductoDA, ProductoDA>();
builder.Services.AddScoped<IAlertasDA, AlertasDA>();
builder.Services.AddScoped<ICiclosDA, CiclosDA>();
builder.Services.AddScoped<ITiposRecursoDA, TiposRecursoDA>();
builder.Services.AddScoped<IConsumosDA, ConsumosDA>();
builder.Services.AddScoped<IChecklistDA, ChecklistDA>();
builder.Services.AddScoped<IEvidenceDA, EvidenceDA>();
builder.Services.AddScoped<IHistoryDA, HistoryDA>();
builder.Services.AddScoped<IClienteDA, ClienteDA>();
builder.Services.AddScoped<IKpiDA, KpiDA>();
builder.Services.AddScoped<IReportesDA, ReportesDA>();
builder.Services.AddScoped<IProveedoresDA, ProveedoresDA>(); // to be implemented
builder.Services.AddScoped<IPlagasDA, PlagasDA>(); // to be implemented
builder.Services.AddScoped<ITorresDA, TorresDA>(); // to be implemented
builder.Services.AddScoped<IEmpleadoDA, EmpleadoDA>();
builder.Services.AddScoped<IEstadoPagoDA, EstadoPagoDA>();
builder.Services.AddScoped<IEstadoVentaDA, EstadoVentaDA>();
builder.Services.AddScoped<IMetodoPagoDA, MetodoPagoDA>();
builder.Services.AddScoped<IRolDA, RolDA>();
builder.Services.AddScoped<ITipoClienteDA, TipoClienteDA>();
builder.Services.AddScoped<ITipoEntregaDA, TipoEntregaDA>();
builder.Services.AddScoped<IInventarioDA, InventarioDA>();
builder.Services.AddScoped<IVentaDA, VentaDA>();

// Register Flow layer
builder.Services.AddScoped<ITipoCultivoFlujo, TipoCultivoFlujo>();
builder.Services.AddScoped<ICategoriaFlujo, CategoriaFlujo>();
builder.Services.AddScoped<IVariedadFlujo, VariedadFlujo>();
builder.Services.AddScoped<IProductoFlujo, ProductoFlujo>();
builder.Services.AddScoped<IAlertasFlujo, AlertasFlujo>();
builder.Services.AddScoped<ICiclosFlujo, CiclosFlujo>();
builder.Services.AddScoped<ITiposRecursoFlujo, TiposRecursoFlujo>();
builder.Services.AddScoped<IConsumosFlujo, ConsumosFlujo>();
builder.Services.AddScoped<IChecklistFlujo, ChecklistFlujo>();
builder.Services.AddScoped<IEvidenceFlujo, EvidenceFlujo>();
builder.Services.AddScoped<IHistoryFlujo, HistoryFlujo>();
builder.Services.AddScoped<IClienteFlujo, ClienteFlujo>();
builder.Services.AddScoped<IKpiFlujo, KpiFlujo>();
builder.Services.AddScoped<IReportesFlujo, ReportesFlujo>();
builder.Services.AddScoped<IProveedoresFlujo, ProveedoresFlujo>();
builder.Services.AddScoped<IPlagasFlujo, PlagasFlujo>();
builder.Services.AddScoped<ITorresFlujo, TorresFlujo>();
builder.Services.AddScoped<IEmpleadoFlujo, EmpleadoFlujo>();
builder.Services.AddScoped<IEstadoPagoFlujo, EstadoPagoFlujo>();
builder.Services.AddScoped<IEstadoVentaFlujo, EstadoVentaFlujo>();
builder.Services.AddScoped<IMetodoPagoFlujo, MetodoPagoFlujo>();
builder.Services.AddScoped<IRolFlujo, RolFlujo>();
builder.Services.AddScoped<ITipoClienteFlujo, TipoClienteFlujo>();
builder.Services.AddScoped<ITipoEntregaFlujo, TipoEntregaFlujo>();
builder.Services.AddScoped<IInventarioFlujo, InventarioFlujo>();
builder.Services.AddScoped<IVentaFlujo, VentaFlujo>();

// Register services
builder.Services.AddScoped<IExportService, ExportService>();

// Add JWT Authentication with development fallback
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

// For development only – use default values if not configured
if (string.IsNullOrEmpty(jwtKey))
{
    jwtKey = "YourDevelopmentSecretKeyHereAtLeast32CharactersLong!";
    Console.WriteLine("Warning: JWT Key not configured. Using development fallback.");
}
if (string.IsNullOrEmpty(jwtIssuer))
    jwtIssuer = "Hidroverde";
if (string.IsNullOrEmpty(jwtAudience))
    jwtAudience = "HidroverdeAPI";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();