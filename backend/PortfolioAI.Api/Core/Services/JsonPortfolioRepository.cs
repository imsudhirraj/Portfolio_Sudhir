using PortfolioAI.Api.Core.Interfaces;
using PortfolioAI.Api.Core.Models;

namespace PortfolioAI.Api.Core.Services;

public class JsonPortfolioRepository(IFileStorageService fileStorage, ILogger<JsonPortfolioRepository> logger) : IPortfolioRepository
{
    private static string GetPortfolioPath(string userId) => Path.Combine("users", userId, "portfolio.json");

    public async Task<Portfolio> GetOrCreatePortfolioAsync(string userId, CancellationToken cancellationToken = default)
    {
        var path = GetPortfolioPath(userId);
        var existing = await fileStorage.ReadJsonAsync<Portfolio>(path, cancellationToken);
        if (existing != null)
        {
            return existing;
        }

        logger.LogInformation("Creating default starter portfolio for user {UserId}", userId);
        var starter = CreateStarterPortfolio();
        await fileStorage.WriteJsonAsync(path, starter, createBackup: false, cancellationToken);
        return starter;
    }

    public async Task<Portfolio?> GetPortfolioAsync(string userId, CancellationToken cancellationToken = default)
    {
        var path = GetPortfolioPath(userId);
        return await fileStorage.ReadJsonAsync<Portfolio>(path, cancellationToken);
    }

    public async Task<Portfolio> SavePortfolioAsync(string userId, Portfolio portfolio, CancellationToken cancellationToken = default)
    {
        portfolio.UpdatedAtUtc = DateTime.UtcNow;
        var path = GetPortfolioPath(userId);
        await fileStorage.WriteJsonAsync(path, portfolio, createBackup: true, cancellationToken);
        return portfolio;
    }

    public async Task<Portfolio> UpdateProfileAsync(string userId, Profile profile, CancellationToken cancellationToken = default)
    {
        var portfolio = await GetOrCreatePortfolioAsync(userId, cancellationToken);
        portfolio.Profile = profile;
        return await SavePortfolioAsync(userId, portfolio, cancellationToken);
    }

    public async Task<Portfolio> UpdateSummaryAsync(string userId, Summary summary, CancellationToken cancellationToken = default)
    {
        var portfolio = await GetOrCreatePortfolioAsync(userId, cancellationToken);
        portfolio.Summary = summary;
        return await SavePortfolioAsync(userId, portfolio, cancellationToken);
    }

    public async Task<Portfolio> UpdateThemeAsync(string userId, ThemeConfig theme, CancellationToken cancellationToken = default)
    {
        var portfolio = await GetOrCreatePortfolioAsync(userId, cancellationToken);
        portfolio.Theme = theme;
        return await SavePortfolioAsync(userId, portfolio, cancellationToken);
    }

    public async Task<Portfolio> UpdateSectionsAsync(string userId, SectionsConfig sections, CancellationToken cancellationToken = default)
    {
        var portfolio = await GetOrCreatePortfolioAsync(userId, cancellationToken);
        portfolio.Sections = sections;
        return await SavePortfolioAsync(userId, portfolio, cancellationToken);
    }

    public async Task<bool> DeletePortfolioAsync(string userId, CancellationToken cancellationToken = default)
    {
        var path = GetPortfolioPath(userId);
        return await fileStorage.DeleteFileAsync(path);
    }

    private static Portfolio CreateStarterPortfolio()
    {
        return new Portfolio
        {
            Profile = new Profile
            {
                FullName = "Sudhir Raj",
                ProfessionalTitle = "Senior Software Engineer",
                Email = "sudhir.raj@example.com",
                Location = "Bengaluru, India",
                Website = "https://portfolioai.com/u/sudhir-raj",
                Github = "https://github.com/sudhir-raj",
                Linkedin = "https://linkedin.com/in/sudhir-raj"
            },
            Summary = new Summary
            {
                Title = "About Me",
                Content = "Passionate full-stack software engineer with expertise in modern web architectures, distributed backend systems, and AI integration. Dedicated to building reliable, high-performance, and beautifully engineered user experiences."
            },
            Skills =
            [
                new SkillItem { Name = "C# / .NET 9", Category = "Backend", Level = "Expert" },
                new SkillItem { Name = "ASP.NET Core Web API", Category = "Backend", Level = "Expert" },
                new SkillItem { Name = "Angular & TypeScript", Category = "Frontend", Level = "Advanced" },
                new SkillItem { Name = "Microservices Architecture", Category = "Backend", Level = "Advanced" },
                new SkillItem { Name = "PostgreSQL & SQL Server", Category = "Database", Level = "Advanced" },
                new SkillItem { Name = "Docker & Kubernetes", Category = "DevOps", Level = "Intermediate" },
                new SkillItem { Name = "AWS / Azure Cloud", Category = "Cloud", Level = "Advanced" },
                new SkillItem { Name = "LLM & AI Integration", Category = "Other", Level = "Intermediate" }
            ],
            Experience =
            [
                new ExperienceItem
                {
                    Company = "Tech Innovators Inc.",
                    JobTitle = "Senior Full Stack Engineer",
                    Location = "Bengaluru, India",
                    StartDate = "2022-03",
                    EndDate = "Present",
                    IsCurrent = true,
                    Description = "Leading architecture and development of scalable cloud-native microservices and responsive web applications.",
                    Responsibilities =
                    [
                        "Architected and deployed high-throughput ASP.NET Core APIs handling 10M+ daily events.",
                        "Mentored junior engineers and instituted code review standards and automated CI/CD pipelines.",
                        "Modernized frontend applications to Angular standalone architecture with Signals."
                    ],
                    Achievements =
                    [
                        "Reduced end-to-end API response latency by 42% through caching and query optimization.",
                        "Designed zero-downtime deployment pipelines reducing deployment cycle time from hours to minutes."
                    ],
                    Technologies = ["C#", ".NET 9", "Angular", "Docker", "AWS", "Redis"]
                }
            ],
            Projects =
            [
                new ProjectItem
                {
                    Name = "PortfolioAI Platform",
                    Description = "An AI-powered, database-free portfolio builder SaaS that converts resumes into interactive, publication-ready portfolios.",
                    Role = "Lead Architect & Developer",
                    Technologies = ["Angular 20", ".NET 9", "C#", "AI LLM", "SCSS", "JSON File Persistence"],
                    Responsibilities =
                    [
                        "Designed atomic JSON file storage engine with automatic backup rotation.",
                        "Built multi-theme responsive rendering engine supporting desktop, tablet, and mobile previews."
                    ],
                    Achievements =
                    [
                        "Zero-database footprint with high throughput and instant cold-start loading."
                    ],
                    ProjectUrl = "https://portfolioai.com",
                    GithubUrl = "https://github.com/sudhir-raj/portfolio-ai",
                    IsFeatured = true
                }
            ],
            Education =
            [
                new EducationItem
                {
                    Institution = "National Institute of Technology",
                    Degree = "Bachelor of Technology",
                    FieldOfStudy = "Computer Science and Engineering",
                    StartDate = "2016",
                    EndDate = "2020",
                    Grade = "8.8 / 10 CGPA"
                }
            ],
            Certifications =
            [
                new CertificationItem
                {
                    Name = "AWS Certified Solutions Architect - Associate",
                    Issuer = "Amazon Web Services",
                    IssueDate = "2023-05",
                    ExpiryDate = "2026-05"
                }
            ],
            Sections = new SectionsConfig(),
            Theme = new ThemeConfig { Name = "developer", PrimaryColor = "#3b82f6", AccentColor = "#8b5cf6" },
            Publication = new PublicationConfig { IsPublished = false, Slug = "sudhir-raj" }
        };
    }
}
