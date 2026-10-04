export interface UserSettings {
  themeMode: 'dark' | 'light' | 'system';
  autoDeleteResumeAfterAnalysis: boolean;
  emailNotifications: boolean;
  updatedAtUtc?: string;
}
