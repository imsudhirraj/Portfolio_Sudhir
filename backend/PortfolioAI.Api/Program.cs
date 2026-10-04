using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PortfolioAI.Api.Core.Interfaces;
using PortfolioAI.Api.Core.Services;
using PortfolioAI.Api.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add Controllers & JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();

// Swagger with JWT Security Definition
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "PortfolioAI API",
        Version = "v1",
        Description = "Production-grade database-free API for AI Portfolio SaaS."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token directly or with 'Bearer ' prefix."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Storage and Domain Services
builder.Services.AddSingleton<IFileStorageService, JsonFileStorageService>();
builder.Services.AddSingleton<IPublicSlugRepository, JsonPublicSlugRepository>();
builder.Services.AddScoped<IPortfolioRepository, JsonPortfolioRepository>();
builder.Services.AddScoped<IResumeStorage, FileResumeStorage>();
builder.Services.AddSingleton<DocumentTextExtractor>();
builder.Services.AddScoped<IResumeAIService, ResumeAIService>();
builder.Services.AddScoped<IUserContext, UserContext>();
builder.Services.AddSingleton<JwtTokenService>();

// JWT Authentication
var secretKey = builder.Configuration["Jwt:SecretKey"] ?? "PortfolioAI_Super_Secret_Key_For_Development_Min_32_Characters_Long!";
var issuer = builder.Configuration["Jwt:Issuer"] ?? "PortfolioAI.Api";
var audience = builder.Configuration["Jwt:Audience"] ?? "PortfolioAI.Client";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // set true in production with SSL certificates
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ValidateIssuer = true,
        ValidIssuer = issuer,
        ValidateAudience = true,
        ValidAudience = audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromMinutes(5)
    };
});

builder.Services.AddAuthorization();

// CORS
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ??
[
    "http://localhost:4200",
    "https://localhost:4200"
];

builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultCorsPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Middleware pipeline
app.UseMiddleware<SecurityHeadersMiddleware>();
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PortfolioAI API v1");
    });
}

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors("DefaultCorsPolicy");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();
