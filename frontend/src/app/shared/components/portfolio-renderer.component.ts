import { Component, input, computed } from '@angular/core';
import { Portfolio, PublicPortfolio } from '../../core/models/portfolio.model';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-portfolio-renderer',
  standalone: true,
  imports: [IconComponent],
  template: `
    @if (data(); as p) {
      <div
        class="portfolio-canvas"
        [class]="'theme-' + (p.theme.name || 'developer')"
        [style.--p-primary]="p.theme.primaryColor || '#6366f1'"
        [style.--p-accent]="p.theme.accentColor || '#a855f7'"
        [style.--p-font]="p.theme.font || 'Inter'"
      >
        <!-- Dynamic Ordered Sections -->
        @for (secKey of p.sections.sectionOrder || defaultOrder; track secKey) {
          @switch (secKey) {
            @case ('hero') {
              @if (p.sections.hero !== false) {
                <header class="p-section hero-section">
                  <div class="hero-inner">
                    @if (p.profile.profileImage) {
                      <img [src]="p.profile.profileImage" alt="Profile" class="hero-avatar-img" />
                    } @else {
                      <div class="hero-avatar-init">{{ initials(p.profile.fullName) }}</div>
                    }

                    <div class="hero-text">
                      <div class="avail-badge">
                        <span class="pulsing-dot"></span>
                        <span>Available for high-impact opportunities</span>
                      </div>
                      <h1 class="hero-name">{{ p.profile.fullName || 'Your Name' }}</h1>
                      <h2 class="hero-pro-title">{{ p.profile.professionalTitle || 'Software Architect' }}</h2>

                      <div class="hero-meta">
                        @if (p.profile.location) {
                          <span class="meta-item">
                            <app-icon name="map-pin" [size]="14" />
                            <span>{{ p.profile.location }}</span>
                          </span>
                        }
                        @if (p.profile.email) {
                          <a [href]="'mailto:' + p.profile.email" class="meta-item email-link">
                            <app-icon name="mail" [size]="14" />
                            <span>{{ p.profile.email }}</span>
                          </a>
                        }
                      </div>

                      <div class="hero-socials">
                        @if (p.profile.github) {
                          <a [href]="p.profile.github" target="_blank" class="social-btn" title="GitHub">
                            <app-icon name="github" [size]="16" />
                            <span>GitHub</span>
                          </a>
                        }
                        @if (p.profile.linkedin) {
                          <a [href]="p.profile.linkedin" target="_blank" class="social-btn" title="LinkedIn">
                            <app-icon name="linkedin" [size]="16" />
                            <span>LinkedIn</span>
                          </a>
                        }
                        @if (p.profile.website) {
                          <a [href]="p.profile.website" target="_blank" class="social-btn" title="Website">
                            <app-icon name="globe" [size]="16" />
                            <span>Website</span>
                          </a>
                        }
                      </div>
                    </div>
                  </div>
                </header>
              }
            }

            @case ('about') {
              @if (p.sections.about !== false && p.summary.content) {
                <section class="p-section about-section">
                  <h3 class="section-title">{{ p.summary.title || 'About Me' }}</h3>
                  <div class="about-content">
                    <p>{{ p.summary.content }}</p>
                  </div>
                </section>
              }
            }

            @case ('skills') {
              @if (p.sections.skills !== false && p.skills.length) {
                <section class="p-section skills-section">
                  <h3 class="section-title">Technical Expertise</h3>
                  <div class="skills-categories-grid">
                    @for (cat of groupedSkills(); track cat.category) {
                      <div class="skill-category-block">
                        <h4 class="category-header">{{ cat.category }}</h4>
                        <div class="skill-tags">
                          @for (s of cat.items; track s.id) {
                            <span class="skill-pill">
                              <span class="pill-name">{{ s.name }}</span>
                              @if (s.level) {
                                <span class="pill-level">{{ s.level }}</span>
                              }
                            </span>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </section>
              }
            }

            @case ('experience') {
              @if (p.sections.experience !== false && p.experience.length) {
                <section class="p-section experience-section">
                  <h3 class="section-title">Career Experience</h3>
                  <div class="timeline-list">
                    @for (exp of p.experience; track exp.id) {
                      <div class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div class="timeline-body">
                          <div class="timeline-top">
                            <div>
                              <h4 class="job-title">{{ exp.jobTitle }}</h4>
                              <div class="company-row">
                                <span class="company">{{ exp.company }}</span>
                                @if (exp.location) {
                                  <span class="loc">• {{ exp.location }}</span>
                                }
                              </div>
                            </div>
                            <span class="date-badge">
                              {{ exp.startDate }} — {{ exp.isCurrent ? 'Present' : exp.endDate }}
                            </span>
                          </div>

                          @if (exp.description) {
                            <p class="role-desc">{{ exp.description }}</p>
                          }

                          @if (exp.responsibilities.length) {
                            <ul class="bullets-list">
                              @for (resp of exp.responsibilities; track resp) {
                                <li>{{ resp }}</li>
                              }
                            </ul>
                          }

                          @if (exp.technologies.length) {
                            <div class="tech-row">
                              @for (tech of exp.technologies; track tech) {
                                <span class="tech-pill">{{ tech }}</span>
                              }
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </section>
              }
            }

            @case ('projects') {
              @if (p.sections.projects !== false && p.projects.length) {
                <section class="p-section projects-section">
                  <h3 class="section-title">Featured Projects</h3>
                  <div class="projects-grid">
                    @for (proj of p.projects; track proj.id) {
                      <div class="project-card" [class.featured]="proj.isFeatured">
                        <div class="proj-header">
                          <h4 class="proj-name">{{ proj.name }}</h4>
                          @if (proj.isFeatured) {
                            <span class="feat-star">★ Featured</span>
                          }
                        </div>

                        @if (proj.role) {
                          <span class="proj-role">{{ proj.role }}</span>
                        }

                        <p class="proj-desc">{{ proj.description }}</p>

                        @if (proj.technologies.length) {
                          <div class="proj-tech">
                            @for (t of proj.technologies; track t) {
                              <span class="tech-tag">{{ t }}</span>
                            }
                          </div>
                        }

                        <div class="proj-links">
                          @if (proj.projectUrl) {
                            <a [href]="proj.projectUrl" target="_blank" class="link-btn">
                              <app-icon name="external" [size]="14" />
                              <span>Live Demo</span>
                            </a>
                          }
                          @if (proj.githubUrl) {
                            <a [href]="proj.githubUrl" target="_blank" class="link-btn">
                              <app-icon name="github" [size]="14" />
                              <span>Source Code</span>
                            </a>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </section>
              }
            }

            @case ('education') {
              @if (p.sections.education !== false && p.education.length) {
                <section class="p-section education-section">
                  <h3 class="section-title">Education</h3>
                  <div class="edu-grid">
                    @for (edu of p.education; track edu.id) {
                      <div class="edu-card">
                        <div class="edu-top">
                          <h4 class="edu-degree">{{ edu.degree }}</h4>
                          <span class="edu-dates">{{ edu.startDate }} — {{ edu.endDate }}</span>
                        </div>
                        <div class="edu-inst">{{ edu.institution }}</div>
                        @if (edu.fieldOfStudy) {
                          <div class="edu-field">{{ edu.fieldOfStudy }}</div>
                        }
                        @if (edu.grade) {
                          <span class="edu-grade">{{ edu.grade }}</span>
                        }
                      </div>
                    }
                  </div>
                </section>
              }
            }

            @case ('certifications') {
              @if (p.sections.certifications !== false && p.certifications.length) {
                <section class="p-section certs-section">
                  <h3 class="section-title">Certifications</h3>
                  <div class="certs-grid">
                    @for (cert of p.certifications; track cert.id) {
                      <div class="cert-card">
                        <div class="cert-name">{{ cert.name }}</div>
                        <div class="cert-issuer">{{ cert.issuer }} • {{ cert.issueDate }}</div>
                        @if (cert.credentialUrl) {
                          <a [href]="cert.credentialUrl" target="_blank" class="cert-link">Verify Credential →</a>
                        }
                      </div>
                    }
                  </div>
                </section>
              }
            }

            @case ('contact') {
              @if (p.sections.contact !== false) {
                <section class="p-section contact-section">
                  <div class="contact-box">
                    <h3>Let's Build Something Exceptional</h3>
                    <p>Have a question or looking to collaborate? Feel free to reach out directly.</p>
                    <div class="contact-btn-row">
                      @if (p.profile.email) {
                        <a [href]="'mailto:' + p.profile.email" class="contact-primary-btn">
                          <app-icon name="mail" [size]="16" />
                          <span>{{ p.profile.email }}</span>
                        </a>
                      }
                      @if (p.profile.linkedin) {
                        <a [href]="p.profile.linkedin" target="_blank" class="contact-secondary-btn">
                          <app-icon name="linkedin" [size]="16" />
                          <span>LinkedIn</span>
                        </a>
                      }
                    </div>
                  </div>
                </section>
              }
            }
          }
        }

        <!-- Clean PortfolioAI Footer -->
        <footer class="portfolio-footer">
          <div class="footer-container">
            <span>{{ p.profile.fullName }} © {{ currentYear }}</span>
            <span class="footer-powered">
              Built with <a href="/" target="_blank">PortfolioAI</a>
            </span>
          </div>
        </footer>
      </div>
    }
  `,
  styles: [`
    .portfolio-canvas {
      font-family: var(--p-font, 'Inter'), sans-serif;
      width: 100%;
      min-height: 100%;
      background: var(--canvas-bg, #0b0f19);
      color: var(--canvas-text, #f1f5f9);
      padding: 3.5rem 2rem;
      box-sizing: border-box;
      line-height: 1.6;
    }

    .p-section {
      max-width: 900px;
      margin: 0 auto 3.5rem;
    }

    .section-title {
      font-size: 1.375rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      letter-spacing: -0.02em;
      position: relative;
      display: inline-block;
    }

    /* ----------------------------------------------------
       THEME 1: DEVELOPER (Modern engineering, tags, sleek dark)
       ---------------------------------------------------- */
    .theme-developer {
      --canvas-bg: #090d16;
      --canvas-text: #f8fafc;
      --card-bg: rgba(17, 24, 39, 0.7);
      --border-line: rgba(255, 255, 255, 0.08);

      .section-title {
        color: var(--p-primary, #6366f1);
        font-family: 'JetBrains Mono', monospace;
        &::before {
          content: "// ";
          opacity: 0.5;
        }
      }

      .hero-section {
        border-bottom: 1px solid var(--border-line);
        padding-bottom: 3rem;
      }

      .hero-inner {
        display: flex;
        align-items: center;
        gap: 2rem;
      }

      .hero-avatar-init {
        width: 80px;
        height: 80px;
        border-radius: 12px;
        background: linear-gradient(135deg, var(--p-primary), var(--p-accent));
        color: #ffffff;
        font-weight: 800;
        font-size: 1.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .hero-avatar-img {
        width: 80px;
        height: 80px;
        border-radius: 12px;
        object-fit: cover;
      }

      .hero-name {
        font-size: 2.25rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        line-height: 1.2;
      }

      .hero-pro-title {
        font-size: 1.125rem;
        color: #94a3b8;
        font-weight: 500;
        margin: 0.25rem 0 1rem;
      }

      .hero-meta, .hero-socials {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        align-items: center;
      }

      .meta-item {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.8125rem;
        color: #64748b;
      }

      .social-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.375rem 0.875rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border-line);
        border-radius: 6px;
        font-size: 0.8125rem;
        color: #cbd5e1;
        text-decoration: none;
        transition: all 0.2s;

        &:hover {
          background: rgba(99, 102, 241, 0.15);
          border-color: var(--p-primary);
          color: #ffffff;
        }
      }

      .pulsing-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
        display: inline-block;
        box-shadow: 0 0 8px #10b981;
      }

      .avail-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        color: #10b981;
        background: rgba(16, 185, 129, 0.1);
        padding: 0.25rem 0.625rem;
        border-radius: 9999px;
        margin-bottom: 0.75rem;
      }

      .skills-categories-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1.25rem;
      }

      .skill-category-block {
        background: var(--card-bg);
        border: 1px solid var(--border-line);
        border-radius: 10px;
        padding: 1.25rem;

        .category-header {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: #94a3b8;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
        }

        .skill-tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .skill-pill {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-line);
          padding: 0.25rem 0.625rem;
          border-radius: 6px;
          font-size: 0.8125rem;
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;

          .pill-level {
            font-size: 0.6875rem;
            color: var(--p-primary);
          }
        }
      }

      .timeline-list {
        display: flex;
        flex-direction: column;
        gap: 1.75rem;
      }

      .timeline-item {
        position: relative;
        padding-left: 1.5rem;
        border-left: 2px solid var(--border-line);

        .timeline-marker {
          position: absolute;
          left: -6px;
          top: 4px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--p-primary);
        }

        .timeline-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.5rem;

          .job-title { font-size: 1.125rem; font-weight: 700; color: #ffffff; }
          .company-row { color: var(--p-primary); font-size: 0.875rem; }
          .date-badge {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.75rem;
            color: #94a3b8;
            background: rgba(255, 255, 255, 0.05);
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
          }
        }

        .role-desc {
          font-size: 0.9375rem;
          color: #cbd5e1;
          margin-bottom: 0.75rem;
        }

        .tech-row {
          display: flex;
          gap: 0.375rem;
          flex-wrap: wrap;

          .tech-pill {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.6875rem;
            background: rgba(99, 102, 241, 0.1);
            color: #818cf8;
            padding: 0.125rem 0.5rem;
            border-radius: 4px;
          }
        }
      }

      .projects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.25rem;
      }

      .project-card {
        background: var(--card-bg);
        border: 1px solid var(--border-line);
        border-radius: 12px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;

        &.featured {
          border-color: rgba(99, 102, 241, 0.4);
          background: linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, var(--card-bg) 100%);
        }

        .proj-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;

          .proj-name { font-size: 1.125rem; font-weight: 700; color: #ffffff; }
          .feat-star { font-size: 0.6875rem; color: #f59e0b; }
        }

        .proj-role {
          font-size: 0.75rem;
          color: var(--p-primary);
          margin-bottom: 0.75rem;
        }

        .proj-desc {
          font-size: 0.875rem;
          color: #94a3b8;
          line-height: 1.5;
          margin-bottom: 1.25rem;
          flex: 1;
        }

        .proj-tech {
          display: flex;
          gap: 0.375rem;
          flex-wrap: wrap;
          margin-bottom: 1.25rem;

          .tech-tag {
            font-size: 0.6875rem;
            background: rgba(255, 255, 255, 0.05);
            padding: 0.125rem 0.5rem;
            border-radius: 4px;
            color: #cbd5e1;
          }
        }

        .proj-links {
          display: flex;
          gap: 0.5rem;

          .link-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.75rem;
            font-weight: 600;
            color: #cbd5e1;
            padding: 0.375rem 0.75rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 6px;
            text-decoration: none;

            &:hover {
              color: #ffffff;
              background: var(--p-primary);
            }
          }
        }
      }

      .contact-box {
        text-align: center;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
        border: 1px solid var(--border-line);
        border-radius: 16px;
        padding: 3rem 1.5rem;

        h3 { font-size: 1.5rem; margin-bottom: 0.5rem; }
        p { color: #94a3b8; max-width: 480px; margin: 0 auto 1.5rem; font-size: 0.9375rem; }
      }

      .contact-btn-row {
        display: flex;
        justify-content: center;
        gap: 0.75rem;
        flex-wrap: wrap;

        .contact-primary-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--p-primary);
          color: #ffffff;
          padding: 0.625rem 1.25rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          text-decoration: none;
        }

        .contact-secondary-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 0.625rem 1.25rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          text-decoration: none;
        }
      }
    }

    /* ----------------------------------------------------
       THEME 2: MINIMAL (Recruiter-focused, clean, high contrast)
       ---------------------------------------------------- */
    .theme-minimal {
      --canvas-bg: #ffffff;
      --canvas-text: #111827;
      background: #ffffff;
      color: #111827;

      .section-title {
        color: #111827;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-size: 0.875rem;
        border-bottom: 2px solid #111827;
        padding-bottom: 0.25rem;
      }

      .hero-inner {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .hero-name {
        font-size: 2.75rem;
        font-weight: 900;
        color: #111827;
        letter-spacing: -0.04em;
      }

      .hero-pro-title {
        font-size: 1.25rem;
        color: #4b5563;
        margin-bottom: 1rem;
      }

      .hero-meta, .hero-socials {
        display: flex;
        justify-content: center;
        gap: 1.5rem;
      }

      .social-btn {
        color: #111827;
        font-weight: 600;
        font-size: 0.875rem;
        text-decoration: underline;
      }

      .timeline-item {
        border-bottom: 1px solid #e5e7eb;
        padding: 1.25rem 0;
        .job-title { font-size: 1.125rem; font-weight: 700; color: #111827; }
        .company-row { color: #4b5563; font-weight: 600; font-size: 0.875rem; }
      }

      .project-card {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 1.25rem;
        margin-bottom: 1rem;
        .proj-name { font-weight: 700; color: #111827; }
      }

      .skill-pill {
        border: 1px solid #d1d5db;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8125rem;
        color: #111827;
      }
    }

    /* ----------------------------------------------------
       THEME 3: EXECUTIVE (Premium corporate, navy/slate, serif)
       ---------------------------------------------------- */
    .theme-executive {
      --canvas-bg: #0f172a;
      --canvas-text: #f8fafc;
      background: #0f172a;
      color: #f8fafc;

      h1, h2, h3, h4 {
        font-family: 'Playfair Display', Georgia, serif;
      }

      .section-title {
        color: #e2e8f0;
        font-size: 1.5rem;
        border-left: 3px solid #38bdf8;
        padding-left: 0.75rem;
      }

      .hero-inner {
        display: flex;
        gap: 2rem;
        align-items: center;
      }

      .hero-name {
        font-size: 2.75rem;
        color: #ffffff;
      }

      .hero-pro-title {
        font-size: 1.25rem;
        color: #94a3b8;
      }

      .project-card, .skill-category-block, .contact-box {
        background: #1e293b;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 1.5rem;
      }

      .social-btn {
        background: #334155;
        color: #ffffff;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        text-decoration: none;
      }
    }

    /* ----------------------------------------------------
       THEME 4: ELEGANT (Editorial, warm typography, sophisticated)
       ---------------------------------------------------- */
    .theme-elegant {
      --canvas-bg: #faf8f5;
      --canvas-text: #292524;
      background: #faf8f5;
      color: #292524;

      h1, h2, h3, h4 {
        font-family: 'Playfair Display', Georgia, serif;
      }

      .section-title {
        color: #1c1917;
        font-size: 1.5rem;
        font-style: italic;
      }

      .hero-inner {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .hero-name {
        font-size: 3rem;
        color: #1c1917;
      }

      .hero-pro-title {
        color: #78716c;
        font-size: 1.125rem;
        font-style: italic;
      }

      .project-card {
        background: #ffffff;
        border: 1px solid #e7e5e4;
        border-radius: 12px;
        padding: 1.5rem;
      }

      .skill-pill {
        background: #f5f5f4;
        border: 1px solid #e7e5e4;
        color: #292524;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
      }
    }

    .portfolio-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 2rem;
      margin-top: 4rem;

      .footer-container {
        max-width: 900px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        font-size: 0.8125rem;
        color: #64748b;

        a {
          color: inherit;
          text-decoration: underline;
        }
      }
    }
  `]
})
export class PortfolioRendererComponent {
  data = input<Portfolio | PublicPortfolio | null>(null);

  defaultOrder = ['hero', 'about', 'skills', 'experience', 'projects', 'education', 'certifications', 'contact'];
  currentYear = new Date().getFullYear();

  groupedSkills = computed(() => {
    const list = this.data()?.skills || [];
    const groups: Record<string, typeof list> = {};

    list.forEach(s => {
      const cat = s.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    });

    return Object.entries(groups).map(([category, items]) => ({ category, items }));
  });

  initials(name?: string): string {
    if (!name) return 'SR';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
}
