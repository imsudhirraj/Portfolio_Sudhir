export interface Profile {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  profileImage: string;
  linkedin: string;
  github: string;
  website: string;
}

export interface Summary {
  title: string;
  content: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'Backend' | 'Frontend' | 'Database' | 'Cloud' | 'DevOps' | 'Tools' | 'Messaging' | 'Security' | 'Other';
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface ExperienceItem {
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
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  role: string;
  technologies: string[];
  responsibilities: string[];
  achievements: string[];
  projectUrl: string;
  githubUrl: string;
  isFeatured: boolean;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  grade: string;
  activities: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  credentialUrl: string;
  credentialId: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface SectionsConfig {
  hero: boolean;
  about: boolean;
  skills: boolean;
  experience: boolean;
  projects: boolean;
  education: boolean;
  certifications: boolean;
  contact: boolean;
  sectionOrder: string[];
}

export interface ThemeConfig {
  name: 'minimal' | 'executive' | 'developer' | 'elegant';
  primaryColor: string;
  accentColor: string;
  font: string;
  backgroundStyle: string;
  borderRadius: string;
  buttonStyle: string;
  sectionSpacing: string;
}

export interface PublicationConfig {
  isPublished: boolean;
  slug: string;
  publishedAtUtc?: string;
}

export interface Portfolio {
  profile: Profile;
  summary: Summary;
  skills: SkillItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  socialLinks: SocialLink[];
  sections: SectionsConfig;
  theme: ThemeConfig;
  publication: PublicationConfig;
  updatedAtUtc?: string;
}

export interface PublicPortfolio {
  profile: Profile;
  summary: Summary;
  skills: SkillItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  socialLinks: SocialLink[];
  sections: SectionsConfig;
  theme: ThemeConfig;
  slug: string;
  publishedAtUtc: string;
}
