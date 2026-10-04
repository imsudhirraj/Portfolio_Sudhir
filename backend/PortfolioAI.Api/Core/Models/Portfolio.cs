namespace PortfolioAI.Api.Core.Models;

public class Portfolio
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
    public PublicationConfig Publication { get; set; } = new();
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public class Profile
{
    public string FullName { get; set; } = string.Empty;
    public string ProfessionalTitle { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string ProfileImage { get; set; } = string.Empty;
    public string Linkedin { get; set; } = string.Empty;
    public string Github { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
}

public class Summary
{
    public string Title { get; set; } = "About Me";
    public string Content { get; set; } = string.Empty;
}

public class SkillItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = "Other"; // Backend, Frontend, Database, Cloud, DevOps, Tools, Messaging, Security, Other
    public string Level { get; set; } = "Intermediate"; // Beginner, Intermediate, Advanced, Expert
}

public class ExperienceItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Company { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
    public bool IsCurrent { get; set; }
    public string Description { get; set; } = string.Empty;
    public List<string> Responsibilities { get; set; } = [];
    public List<string> Achievements { get; set; } = [];
    public List<string> Technologies { get; set; } = [];
}

public class ProjectItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public List<string> Technologies { get; set; } = [];
    public List<string> Responsibilities { get; set; } = [];
    public List<string> Achievements { get; set; } = [];
    public string ProjectUrl { get; set; } = string.Empty;
    public string GithubUrl { get; set; } = string.Empty;
    public bool IsFeatured { get; set; }
}

public class EducationItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Institution { get; set; } = string.Empty;
    public string Degree { get; set; } = string.Empty;
    public string FieldOfStudy { get; set; } = string.Empty;
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
    public string Grade { get; set; } = string.Empty;
    public string Activities { get; set; } = string.Empty;
}

public class CertificationItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Name { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string IssueDate { get; set; } = string.Empty;
    public string ExpiryDate { get; set; } = string.Empty;
    public string CredentialUrl { get; set; } = string.Empty;
    public string CredentialId { get; set; } = string.Empty;
}

public class SocialLink
{
    public string Platform { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
}

public class SectionsConfig
{
    public bool Hero { get; set; } = true;
    public bool About { get; set; } = true;
    public bool Skills { get; set; } = true;
    public bool Experience { get; set; } = true;
    public bool Projects { get; set; } = true;
    public bool Education { get; set; } = true;
    public bool Certifications { get; set; } = false;
    public bool Contact { get; set; } = true;
    public List<string> SectionOrder { get; set; } = [
        "hero", "about", "skills", "experience", "projects", "education", "certifications", "contact"
    ];
}

public class ThemeConfig
{
    public string Name { get; set; } = "developer"; // minimal, executive, developer, elegant
    public string PrimaryColor { get; set; } = "#3b82f6";
    public string AccentColor { get; set; } = "#8b5cf6";
    public string Font { get; set; } = "Inter";
    public string BackgroundStyle { get; set; } = "default"; // default, glass, subtle-grid, minimal-dot
    public string BorderRadius { get; set; } = "md"; // sm, md, lg, full
    public string ButtonStyle { get; set; } = "filled"; // filled, outline, glow
    public string SectionSpacing { get; set; } = "normal"; // compact, normal, relaxed
}

public class PublicationConfig
{
    public bool IsPublished { get; set; }
    public string Slug { get; set; } = string.Empty;
    public DateTime? PublishedAtUtc { get; set; }
}
