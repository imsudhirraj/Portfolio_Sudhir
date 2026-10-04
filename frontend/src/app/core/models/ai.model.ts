export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export interface ExtractedField<T> {
  value?: T;
  confidence: ConfidenceLevel;
  sourceSnippet?: string;
}

export interface ExtractedProfile {
  fullName: ExtractedField<string>;
  professionalTitle: ExtractedField<string>;
  email: ExtractedField<string>;
  phone: ExtractedField<string>;
  location: ExtractedField<string>;
  linkedin: ExtractedField<string>;
  github: ExtractedField<string>;
  website: ExtractedField<string>;
}

export interface ExtractedSummary {
  content: ExtractedField<string>;
}

export interface ExtractedSkillItem {
  id: string;
  name: string;
  category: 'Backend' | 'Frontend' | 'Database' | 'Cloud' | 'DevOps' | 'Tools' | 'Messaging' | 'Security' | 'Other';
  level: string;
  confidence: ConfidenceLevel;
}

export interface ExtractedExperienceItem {
  id: string;
  company: string;
  jobTitle: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
  confidence: ConfidenceLevel;
}

export interface ExtractedProjectItem {
  id: string;
  name: string;
  description: string;
  role: string;
  technologies: string[];
  responsibilities: string[];
  achievements: string[];
  projectUrl: string;
  githubUrl: string;
  confidence: ConfidenceLevel;
}

export interface ExtractedEducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  grade: string;
  activities: string;
  confidence: ConfidenceLevel;
}

export interface ExtractedCertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  credentialUrl: string;
  credentialId: string;
  confidence: ConfidenceLevel;
}

export interface AiAnalysisResult {
  analysisId: string;
  analyzedAtUtc: string;
  profile: ExtractedProfile;
  summary: ExtractedSummary;
  skills: ExtractedSkillItem[];
  experience: ExtractedExperienceItem[];
  projects: ExtractedProjectItem[];
  education: ExtractedEducationItem[];
  certifications: ExtractedCertificationItem[];
  totalExtractedItems: number;
}

export interface ApplySuggestionsRequest {
  applyProfile: boolean;
  applySummary: boolean;
  selectedSkillIds: string[];
  selectedExperienceIds: string[];
  selectedProjectIds: string[];
  selectedEducationIds: string[];
  selectedCertificationIds: string[];
}
