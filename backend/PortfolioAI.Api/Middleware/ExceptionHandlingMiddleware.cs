using System.Net;
using System.Security;
using System.Text.Json;
using PortfolioAI.Api.Core.Models;

namespace PortfolioAI.Api.Middleware;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception occurred while processing request to {Path}", context.Request.Path);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, code, message) = exception switch
        {
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "UNAUTHORIZED", "Authentication is required to perform this action."),
            SecurityException => (HttpStatusCode.Forbidden, "FORBIDDEN", "You do not have permission to access this resource."),
            KeyNotFoundException => (HttpStatusCode.NotFound, "NOT_FOUND", exception.Message),
            ArgumentException => (HttpStatusCode.BadRequest, "INVALID_INPUT", exception.Message),
            InvalidOperationException => (HttpStatusCode.BadRequest, "INVALID_OPERATION", exception.Message),
            _ => (HttpStatusCode.InternalServerError, "INTERNAL_ERROR", "An unexpected error occurred while processing your request.")
        };

        context.Response.StatusCode = (int)statusCode;
        var response = ApiResponse.ErrorResult(message, code);
        await context.Response.WriteAsync(JsonSerializer.Serialize(response, JsonOptions));
    }
}
