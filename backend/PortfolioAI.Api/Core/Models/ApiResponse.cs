namespace PortfolioAI.Api.Core.Models;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? Code { get; set; }
    public T? Data { get; set; }

    public static ApiResponse<T> Ok(T data, string? message = null) =>
        new() { Success = true, Data = data, Message = message };

    public static ApiResponse<T> Fail(string message, string? code = null, T? data = default) =>
        new() { Success = false, Message = message, Code = code, Data = data };
}

public class ApiResponse : ApiResponse<object>
{
    public static ApiResponse SuccessResult(string? message = null) =>
        new() { Success = true, Message = message };

    public static ApiResponse ErrorResult(string message, string? code = null) =>
        new() { Success = false, Message = message, Code = code };
}
