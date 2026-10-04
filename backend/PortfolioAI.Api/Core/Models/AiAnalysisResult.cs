namespace PortfolioAI.Api.Core.Models;

public enum ConfidenceLevel
{
    High,
    Medium,
    Low
}

public class ExtractedField<T>
{
    public T? Value { get; set; }
    public ConfidenceLevel Confidence { get; set; } = ConfidenceLevel.Medium;
    public string? SourceSnippet { get; set; }
}

public class ExtractedProfile
{
    public ExtractedField<string> FullName { get; set; } = new();
    public ExtractedField<string> ProfessionalTitle { get; set; } = new();
    public ExtractedField<string> Email { get; set; } = new();
    public ExtractedField<string> Phone { get; set; } = new();
    public ExtractedField<string> Location { get; set; } = new();
    public ExtractedField<string> Linkedin { get; set; } = new();
    public ExtractedField<string> Github { get; set; } = new();
    public ExtractedField<string> Website { get; set; } = new();
}

public class ExtractedSummary
{
    public ExtractedField<string> Content { get; set; } = new();
}

public class ExtractedExperienceItem
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
    public ConfidenceLevel Confidence { get; set; } = ConfidenceLevel.Medium;
}

public class ExtractedProjectItem
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
    public ConfidenceLevel Confidence { get; set; } = ConfidenceLevel.Medium;
}

public class ExtractedSkillItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = "Other";
    public string Level { get; set; } = "Intermediate";
    public ConfidenceLevel Confidence { get; set; } = ConfidenceLevel.High;
}

public class ExtractedEducationItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Institution { get; set; } = string.Empty;
    public string Degree { get; set; } = string.Empty;
    public string FieldOfStudy { get; set; } = string.Empty;
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
    public string Grade { get; set; } = string.Empty;
    public string Activities { get; set; } = string.Empty;
    public ConfidenceLevel Confidence { get; set; } = ConfidenceLevel.Medium;
}

public class ExtractedCertificationItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Name { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string IssueDate { get; set; } = string.Empty;
    public string ExpiryDate { get; set; } = string.Empty;
    public string CredentialUrl { get; set; } = string.Empty;
    public string CredentialId { get; set; } = string.Empty;
    public ConfidenceLevel Confidence { get; set; } = ConfidenceLevel.Medium;
}

public class AiAnalysisResult
{
    public string AnalysisId { get; set; } = Guid.NewGuid().ToString("N");
    public DateTime AnalyzedAtUtc { get; set; } = DateTime.UtcNow;
    public ExtractedProfile Profile { get; set; } = new();
    public ExtractedSummary Summary { get; set; } = new();
    public List<ExtractedSkillItem> Skills { get; set; } = [];
    public List<ExtractedExperienceItem> Experience { get; set; } = [];
    public List<ExtractedProjectItem> Projects { get; set; } = [];
    public List<ExtractedEducationItem> Education { get; set; } = [];
    public List<ExtractedCertificationItem> Certifications { get; set; } = [];
    public int TotalExtractedItems =>
        (string.IsNullOrWhiteSpace(Profile.FullName.Value) ? 0 : 1) +
        Skills.Count + Experience.Count + Projects.Count + Education.Count + Certifications.Count;
}
