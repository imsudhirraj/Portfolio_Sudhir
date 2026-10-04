namespace PortfolioAI.Api.Core.Models;

public class UserSettings
{
    public string ThemeMode { get; set; } = "dark"; // dark, light, system
    public bool AutoDeleteResumeAfterAnalysis { get; set; } = false;
    public bool EmailNotifications { get; set; } = true;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public class PublicPortfolioDto
{
    public Profile Profile { get; set; } = new();
    public Summary Summary { get; set; } = new();
    public List<SkillItem> Skills { get; set; } = [];
    public List<ExperienceItem> Experience { get; set; } = [];
    public List<ProjectItem> Projects { get; set; } = [];
    public List<EducationItem> Education { get; set; } = [];
    public List<CertificationItem> Certifications { get; set; } = [];
    public List<SocialLink> SocialLinks { get; set; } = [];
    public SectionsConfig Sections { get; set; } = new();
    public ThemeConfig Theme { get; set; } = new();
    public string Slug { get; set; } = string.Empty;
    public DateTime PublishedAtUtc { get; set; }

    public static PublicPortfolioDto FromPortfolio(Portfolio portfolio, string slug)
    {
        return new PublicPortfolioDto
        {
            Profile = portfolio.Profile,
            Summary = portfolio.Summary,
            Skills = portfolio.Skills,
            Experience = portfolio.Experience,
            Projects = portfolio.Projects,
            Education = portfolio.Education,
            Certifications = portfolio.Certifications,
            SocialLinks = portfolio.SocialLinks,
            Sections = portfolio.Sections,
            Theme = portfolio.Theme,
            Slug = slug,
            PublishedAtUtc = portfolio.Publication.PublishedAtUtc ?? DateTime.UtcNow
        };
    }
}
