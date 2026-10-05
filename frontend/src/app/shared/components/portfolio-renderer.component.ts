import { Component, input, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Portfolio, PublicPortfolio } from '../../core/models/portfolio.model';
import { IconComponent } from './icon.component';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-portfolio-renderer',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (data(); as p) {
      <div
        class="portfolio-canvas"
        [class]="'theme-' + (p.theme.name || 'developer')"
        [style.--p-primary]="p.theme.primaryColor || '#6366f1'"
        [style.--p-accent]="p.theme.accentColor || '#a855f7'"
        [style.--p-font]="p.theme.font || 'Inter'"
      >
        <!-- Floating Glassmorphic Top Navbar -->
        <header class="p-nav-bar">
          <div class="nav-inner">
            <div class="nav-brand" (click)="scrollToSection('sec-hero')">
              @if (p.profile.profileImage) {
                <img [src]="p.profile.profileImage" alt="Avatar" class="nav-avatar-img" />
              } @else {
                <div class="nav-avatar-mini">{{ initials(p.profile.fullName) }}</div>
              }
              <div class="nav-name-group">
                <span class="nav-name">{{ p.profile.fullName || 'Portfolio' }}</span>
                <span class="nav-title-tiny">{{ p.profile.professionalTitle || 'Software Engineer' }}</span>
              </div>
            </div>

            <nav class="nav-links">
              @if (p.sections.about !== false && p.summary.content) {
                <button class="nav-link-btn" (click)="scrollToSection('sec-about')">About</button>
              }
              @if (p.sections.skills !== false && p.skills.length) {
                <button class="nav-link-btn" (click)="scrollToSection('sec-skills')">Skills</button>
              }
              @if (p.sections.experience !== false && p.experience.length) {
                <button class="nav-link-btn" (click)="scrollToSection('sec-experience')">Experience</button>
              }
              @if (p.sections.projects !== false && p.projects.length) {
                <button class="nav-link-btn" (click)="scrollToSection('sec-projects')">Projects</button>
              }
              @if (p.sections.education !== false && p.education.length) {
                <button class="nav-link-btn" (click)="scrollToSection('sec-education')">Education</button>
              }
              @if (p.sections.contact !== false) {
                <button class="nav-link-btn" (click)="scrollToSection('sec-contact')">Contact</button>
              }
            </nav>

            <div class="nav-actions">
              @if (p.profile.email) {
                <button
                  class="btn-nav-action"
                  (click)="copyEmail(p.profile.email)"
                  [title]="copiedEmail() ? 'Copied to clipboard!' : 'Copy email address'"
                >
                  <app-icon [name]="copiedEmail() ? 'check' : 'copy'" [size]="14" />
                  <span>{{ copiedEmail() ? 'Copied' : 'Email' }}</span>
                </button>
              }
              <button class="btn-nav-action print-btn" (click)="printPortfolio()" title="Print / Export as PDF">
                <app-icon name="printer" [size]="14" />
                <span>PDF</span>
              </button>
              @if (p.profile.email) {
                <a [href]="'mailto:' + p.profile.email" class="btn-nav-primary">
                  <app-icon name="mail" [size]="14" />
                  <span>Hire Me</span>
                </a>
              }
            </div>
          </div>
        </header>

        <!-- Ambient Background Mesh Glows -->
        <div class="canvas-ambient-glow"></div>

        <!-- Dynamic Ordered Portfolio Content -->
        <div class="canvas-content">
          @for (secKey of p.sections.sectionOrder || defaultOrder; track secKey) {
            @switch (secKey) {
              @case ('hero') {
                @if (p.sections.hero !== false) {
                  <section id="sec-hero" class="p-section hero-section">
                    <div class="hero-inner">
                      <!-- Avatar with Animated Outer Glow -->
                      <div class="hero-avatar-wrapper">
                        @if (p.profile.profileImage) {
                          <img [src]="p.profile.profileImage" alt="Profile" class="hero-avatar-img" />
                        } @else {
                          <div class="hero-avatar-init">{{ initials(p.profile.fullName) }}</div>
                        }
                        <div class="avatar-glow-ring"></div>
                      </div>

                      <div class="hero-text-block">
                        <!-- Live Status Pill -->
                        <div class="status-pill">
                          <span class="pulsing-dot"></span>
                          <span>Available for high-impact opportunities</span>
                        </div>

                        <h1 class="hero-name">{{ p.profile.fullName || 'Sudhir Raj' }}</h1>
                        <h2 class="hero-pro-title">{{ p.profile.professionalTitle || 'Software Developer' }}</h2>

                        <!-- Quick Metadata Badges Strip -->
                        <div class="hero-highlights-strip">
                          @if (p.profile.location) {
                            <div class="highlight-chip">
                              <app-icon name="map-pin" [size]="14" />
                              <span>{{ p.profile.location }}</span>
                            </div>
                          }
                          @if (p.experience.length > 0) {
                            <div class="highlight-chip">
                              <app-icon name="briefcase" [size]="14" />
                              <span>{{ p.experience.length }}+ Roles</span>
                            </div>
                          }
                          @if (p.skills.length > 0) {
                            <div class="highlight-chip">
                              <app-icon name="code" [size]="14" />
                              <span>{{ p.skills.length }}+ Technologies</span>
                            </div>
                          }
                        </div>

                        <!-- Hero Interactive Action Bar -->
                        <div class="hero-actions-row">
                          @if (p.profile.email) {
                            <a [href]="'mailto:' + p.profile.email" class="hero-btn primary-btn">
                              <app-icon name="mail" [size]="16" />
                              <span>Get in Touch</span>
                            </a>
                          }

                          @if (p.profile.github) {
                            <a [href]="p.profile.github" target="_blank" class="hero-btn ghost-btn" title="GitHub Profile">
                              <app-icon name="github" [size]="16" />
                              <span>GitHub</span>
                            </a>
                          }

                          @if (p.profile.linkedin) {
                            <a [href]="p.profile.linkedin" target="_blank" class="hero-btn ghost-btn" title="LinkedIn Profile">
                              <app-icon name="linkedin" [size]="16" />
                              <span>LinkedIn</span>
                            </a>
                          }

                          @if (p.profile.email) {
                            <button
                              class="hero-btn copy-btn"
                              (click)="copyEmail(p.profile.email)"
                              [title]="copiedEmail() ? 'Copied to clipboard' : 'Copy email address'"
                            >
                              <app-icon [name]="copiedEmail() ? 'check' : 'copy'" [size]="15" />
                              <span>{{ copiedEmail() ? 'Copied!' : 'Copy Email' }}</span>
                            </button>
                          }
                        </div>
                      </div>
                    </div>
                  </section>
                }
              }

              @case ('about') {
                @if (p.sections.about !== false && p.summary.content) {
                  <section id="sec-about" class="p-section about-section">
                    <div class="section-header">
                      <span class="section-tag">Overview</span>
                      <h3 class="section-title">{{ p.summary.title || 'About Me' }}</h3>
                    </div>
                    <div class="about-card card-glow">
                      <div class="about-quote-mark">â€œ</div>
                      <p class="about-text">{{ p.summary.content }}</p>
                    </div>
                  </section>
                }
              }

              @case ('skills') {
                @if (p.sections.skills !== false && p.skills.length) {
                  <section id="sec-skills" class="p-section skills-section">
                    <div class="section-header">
                      <span class="section-tag">Technical Skills</span>
                      <h3 class="section-title">Technical Expertise</h3>
                    </div>

                    <div class="skills-categories-grid">
                      @for (cat of groupedSkills(); track cat.category) {
                        <div class="skill-category-card card-glow">
                          <div class="category-header-row">
                            <div class="category-title-group">
                              <app-icon [name]="getCategoryIcon(cat.category)" [size]="16" />
                              <h4 class="category-name">{{ cat.category }}</h4>
                            </div>
                            <span class="item-count-badge">{{ cat.items.length }}</span>
                          </div>

                          <div class="skill-chips-wrap">
                            @for (s of cat.items; track s.id) {
                              <div class="skill-chip" [attr.data-level]="s.level">
                                <span class="skill-name">{{ s.name }}</span>
                                @if (s.level) {
                                  <span class="skill-level-badge" [class]="'level-' + (s.level | lowercase)">
                                    {{ s.level }}
                                  </span>
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

              @case ('experience') {
                @if (p.sections.experience !== false && p.experience.length) {
                  <section id="sec-experience" class="p-section experience-section">
                    <div class="section-header">
                      <span class="section-tag">Experience</span>
                      <h3 class="section-title">Career Experience</h3>
                    </div>

                    <div class="timeline-container">
                      <div class="timeline-spine"></div>

                      @for (exp of p.experience; track exp.id; let i = $index) {
                        <div class="timeline-card-wrapper">
                          <div class="timeline-node" [class.current]="exp.isCurrent || i === 0">
                            <div class="node-core"></div>
                          </div>

                          <div class="timeline-card card-glow">
                            <div class="card-top-row">
                              <div class="role-group">
                                <h4 class="job-title">{{ exp.jobTitle }}</h4>
                                <div class="company-sub-row">
                                  <span class="company-name">{{ exp.company }}</span>
                                  @if (exp.location) {
                                    <span class="location-dot">â€¢</span>
                                    <span class="location-text">
                                      <app-icon name="map-pin" [size]="12" />
                                      {{ exp.location }}
                                    </span>
                                  }
                                </div>
                              </div>

                              <div class="dates-pill" [class.current-date]="exp.isCurrent || exp.endDate === 'Present'">
                                <span class="date-text">
                                  {{ exp.startDate }} â€” {{ exp.isCurrent ? 'Present' : exp.endDate }}
                                </span>
                              </div>
                            </div>

                            @if (exp.description) {
                              <p class="role-summary">{{ exp.description }}</p>
                            }

                            @if (exp.responsibilities.length) {
                              <ul class="responsibilities-list">
                                @for (resp of exp.responsibilities; track resp) {
                                  <li class="resp-item">
                                    <span class="bullet-arrow">â–¹</span>
                                    <span class="resp-text">{{ resp }}</span>
                                  </li>
                                }
                              </ul>
                            }

                            @if (exp.technologies.length) {
                              <div class="card-tech-row">
                                <span class="tech-label">Tech Stack:</span>
                                @for (tech of exp.technologies; track tech) {
                                  <span class="mini-tech-pill">{{ tech }}</span>
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
                  <section id="sec-projects" class="p-section projects-section">
                    <div class="section-header">
                      <span class="section-tag">Featured Projects</span>
                      <h3 class="section-title">Featured Projects</h3>
                    </div>

                    <div class="projects-grid">
                      @for (proj of p.projects; track proj.id) {
                        <div class="project-card card-glow" [class.featured-card]="proj.isFeatured">
                          <div class="proj-card-top">
                            <div class="proj-title-group">
                              <div class="proj-icon-box">
                                <app-icon name="code" [size]="18" />
                              </div>
                              <h4 class="proj-name">{{ proj.name }}</h4>
                            </div>
                            @if (proj.isFeatured) {
                              <span class="featured-badge">â˜… Featured</span>
                            }
                          </div>

                          @if (proj.role) {
                            <div class="proj-role-tag">{{ proj.role }}</div>
                          }

                          <p class="proj-description">{{ proj.description }}</p>

                          @if (proj.technologies.length) {
                            <div class="proj-tech-tags">
                              @for (tech of proj.technologies; track tech) {
                                <span class="proj-tag">{{ tech }}</span>
                              }
                            </div>
                          }

                          <div class="proj-card-footer">
                            @if (proj.githubUrl) {
                              <a [href]="proj.githubUrl" target="_blank" class="proj-btn secondary">
                                <app-icon name="github" [size]="15" />
                                <span>Source Code</span>
                              </a>
                            }
                            @if (proj.projectUrl) {
                              <a [href]="proj.projectUrl" target="_blank" class="proj-btn primary">
                                <app-icon name="external" [size]="15" />
                                <span>Live Demo</span>
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
                  <section id="sec-education" class="p-section education-section">
                    <div class="section-header">
                      <span class="section-tag">Education</span>
                      <h3 class="section-title">Education & Credentials</h3>
                    </div>

                    <div class="education-grid">
                      @for (edu of p.education; track edu.id) {
                        <div class="edu-card card-glow">
                          <div class="edu-card-top">
                            <div class="edu-icon-circle">
                              <app-icon name="grad-cap" [size]="20" />
                            </div>
                            <div class="edu-heading">
                              <h4 class="edu-degree">{{ edu.degree }}</h4>
                              <span class="edu-inst">{{ edu.institution }}</span>
                            </div>
                          </div>

                          <div class="edu-card-meta">
                            @if (edu.startDate || edu.endDate) {
                              <span class="edu-dates">
                                {{ edu.startDate }} â€” {{ edu.endDate }}
                              </span>
                            }
                            @if (edu.grade) {
                              <span class="edu-grade-pill">{{ edu.grade }}</span>
                            }
                          </div>

                          @if (edu.fieldOfStudy) {
                            <div class="edu-field-text">Major: {{ edu.fieldOfStudy }}</div>
                          }
                        </div>
                      }
                    </div>
                  </section>
                }
              }

              @case ('certifications') {
                @if (p.sections.certifications !== false && p.certifications.length) {
                  <section id="sec-certifications" class="p-section certs-section">
                    <div class="section-header">
                      <span class="section-tag">Certifications</span>
                      <h3 class="section-title">Certifications</h3>
                    </div>

                    <div class="certs-grid">
                      @for (cert of p.certifications; track cert.id) {
                        <div class="cert-card card-glow">
                          <div class="cert-top">
                            <div class="cert-icon-box">
                              <app-icon name="award" [size]="20" />
                            </div>
                            <div class="cert-info">
                              <h4 class="cert-name">{{ cert.name }}</h4>
                              <span class="cert-issuer">{{ cert.issuer }}</span>
                            </div>
                          </div>

                          <div class="cert-bottom">
                            @if (cert.issueDate) {
                              <span class="cert-date">Issued: {{ cert.issueDate }}</span>
                            }
                            @if (cert.credentialUrl) {
                              <a [href]="cert.credentialUrl" target="_blank" class="cert-link">
                                <span>Verify Credential</span>
                                <app-icon name="external" [size]="12" />
                              </a>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </section>
                }
              }

              @case ('contact') {
                @if (p.sections.contact !== false) {
                  <section id="sec-contact" class="p-section contact-section">
                    <div class="contact-banner card-glow">
                      <div class="contact-mesh-glow"></div>
                      <div class="contact-content">
                        <span class="contact-eyebrow">READY TO COLLABORATE</span>
                        <h3 class="contact-heading">Let's Build Something Exceptional Together</h3>
                        <p class="contact-subtitle">
                          Open for senior engineering roles, cloud solution development, and high-impact full-stack software initiatives.
                        </p>

                        <div class="contact-buttons-group">
                          @if (p.profile.email) {
                            <a [href]="'mailto:' + p.profile.email" class="contact-action-btn primary">
                              <app-icon name="mail" [size]="18" />
                              <span>{{ p.profile.email }}</span>
                            </a>
                            <button class="contact-action-btn copy" (click)="copyEmail(p.profile.email)">
                              <app-icon [name]="copiedEmail() ? 'check' : 'copy'" [size]="16" />
                              <span>{{ copiedEmail() ? 'Copied!' : 'Copy' }}</span>
                            </button>
                          }

                          @if (p.profile.linkedin) {
                            <a [href]="p.profile.linkedin" target="_blank" class="contact-action-btn secondary">
                              <app-icon name="linkedin" [size]="18" />
                              <span>LinkedIn</span>
                            </a>
                          }

                          @if (p.profile.github) {
                            <a [href]="p.profile.github" target="_blank" class="contact-action-btn secondary">
                              <app-icon name="github" [size]="18" />
                              <span>GitHub</span>
                            </a>
                          }
                        </div>
                      </div>
                    </div>
                  </section>
                }
              }
            }
          }
        </div>

        <!-- Premium Footer -->
        <footer class="portfolio-footer">
          <div class="footer-inner">
            <div class="footer-left">
              <span class="footer-brand">{{ p.profile.fullName }}</span>
              <span class="footer-copy">Â© {{ currentYear }} â€¢ All rights reserved</span>
            </div>
            <div class="footer-right">
              <span class="footer-tech">Engineered with Angular & .NET â€¢ Powered by</span>
              <a href="/" target="_blank" class="footer-brand-link">PortfolioAI</a>
            </div>
          </div>
        </footer>
      </div>
    }
  `,
  styles: [`
    /* ---------------------------------------------------------
       BASE CANVAS & GLOBAL RESETS
       --------------------------------------------------------- */
    .portfolio-canvas {
      font-family: var(--p-font, 'Inter'), -apple-system, BlinkMacSystemFont, sans-serif;
      width: 100%;
      min-height: 100%;
      background: var(--canvas-bg, #090d16);
      color: var(--canvas-text, #f1f5f9);
      position: relative;
      box-sizing: border-box;
      line-height: 1.6;
      overflow-x: hidden;
      scroll-behavior: smooth;
    }

    /* Subtle Engineering Grid Backdrop */
    .canvas-ambient-glow {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 600px;
      pointer-events: none;
      background: radial-gradient(circle at 50% 0%, var(--ambient-glow-color, rgba(99, 102, 241, 0.16)) 0%, transparent 70%);
      z-index: 0;
    }

    .canvas-content {
      position: relative;
      z-index: 1;
      padding: 2.5rem 1.5rem 4rem;
      max-width: 1040px;
      margin: 0 auto;
    }

    .p-section {
      margin-bottom: 4.5rem;
      position: relative;
    }

    .section-header {
      margin-bottom: 2rem;

      .section-tag {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-family: inherit;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--p-primary, #6366f1);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 0.625rem;
        padding: 0.3125rem 0.875rem;
        background: rgba(99, 102, 241, 0.08);
        border: 1px solid rgba(99, 102, 241, 0.22);
        border-radius: 9999px;
        backdrop-filter: blur(8px);
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);

        &::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--p-primary, #6366f1);
          box-shadow: 0 0 8px var(--p-primary, #6366f1);
        }
      }

      .section-title {
        font-size: 1.875rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        color: var(--heading-color, #ffffff);
        line-height: 1.25;
      }
    }

    /* ---------------------------------------------------------
       FLOATING GLASS NAV BAR
       --------------------------------------------------------- */
    .p-nav-bar {
      position: sticky;
      top: 1rem;
      z-index: 100;
      max-width: 1040px;
      margin: 1rem auto 0;
      padding: 0 1.5rem;

      .nav-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.625rem 1.25rem;
        background: var(--nav-bg, rgba(13, 18, 31, 0.75));
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid var(--border-line, rgba(255, 255, 255, 0.08));
        border-radius: 9999px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.35);
        gap: 1rem;
      }

      .nav-brand {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        cursor: pointer;
        text-decoration: none;

        .nav-avatar-mini {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--p-primary, #6366f1), var(--p-accent, #a855f7));
          color: #ffffff;
          font-weight: 700;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .nav-avatar-img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }

        .nav-name-group {
          display: flex;
          flex-direction: column;
          line-height: 1.2;

          .nav-name {
            font-weight: 700;
            font-size: 0.8125rem;
            color: var(--heading-color, #ffffff);
          }

          .nav-title-tiny {
            font-size: 0.6875rem;
            color: var(--text-muted, #94a3b8);
          }
        }
      }

      .nav-links {
        display: flex;
        align-items: center;
        gap: 0.25rem;

        .nav-link-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary, #cbd5e1);
          font-size: 0.8125rem;
          font-weight: 500;
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.08);
          }
        }
      }

      .nav-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .btn-nav-action {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--border-line, rgba(255, 255, 255, 0.08));
          color: var(--text-secondary, #cbd5e1);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: rgba(255, 255, 255, 0.12);
            color: #ffffff;
          }
        }

        .btn-nav-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          background: var(--p-primary, #6366f1);
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.375rem 0.875rem;
          border-radius: 9999px;
          text-decoration: none;
          transition: all 0.2s;

          &:hover {
            opacity: 0.9;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
          }
        }
      }
    }

    @media (max-width: 768px) {
      .p-nav-bar .nav-links { display: none; }
    }

    /* ---------------------------------------------------------
       HERO SECTION
       --------------------------------------------------------- */
    .hero-section {
      padding: 3rem 0 1rem;

      .hero-inner {
        display: flex;
        align-items: center;
        gap: 3rem;
      }

      .hero-avatar-wrapper {
        position: relative;
        flex-shrink: 0;

        .hero-avatar-init {
          width: 120px;
          height: 120px;
          border-radius: 28px;
          background: linear-gradient(135deg, var(--p-primary, #6366f1) 0%, var(--p-accent, #a855f7) 100%);
          color: #ffffff;
          font-weight: 800;
          font-size: 2.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.5);
          border: 2px solid rgba(255, 255, 255, 0.15);
          position: relative;
          z-index: 2;
        }

        .hero-avatar-img {
          width: 120px;
          height: 120px;
          border-radius: 28px;
          object-fit: cover;
          box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.5);
          border: 2px solid rgba(255, 255, 255, 0.15);
          position: relative;
          z-index: 2;
        }

        .avatar-glow-ring {
          position: absolute;
          inset: -10px;
          border-radius: 36px;
          background: radial-gradient(circle, var(--p-primary, #6366f1) 0%, transparent 70%);
          opacity: 0.35;
          filter: blur(14px);
          z-index: 1;
        }
      }

      .hero-text-block {
        flex: 1;

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #10b981;
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 0.75rem;

          .pulsing-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 8px #10b981;
            animation: pulse-green 2s infinite ease-in-out;
          }
        }

        .hero-name {
          font-size: 3rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1.1;
          margin-bottom: 0.375rem;
          background: linear-gradient(135deg, #ffffff 40%, #cbd5e1 75%, var(--p-primary, #6366f1) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-pro-title {
          font-size: 1.25rem;
          font-weight: 500;
          color: var(--p-primary, #818cf8);
          margin-bottom: 1.125rem;
        }

        .hero-highlights-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 0.625rem;
          margin-bottom: 1.5rem;

          .highlight-chip {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            padding: 0.25rem 0.625rem;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid var(--border-line, rgba(255, 255, 255, 0.07));
            border-radius: 6px;
            font-size: 0.8125rem;
            color: var(--text-muted, #94a3b8);
          }
        }

        .hero-actions-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          align-items: center;

          .hero-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1.125rem;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s ease;

            &.primary-btn {
              background: var(--p-primary, #6366f1);
              color: #ffffff;
              box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);

              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
              }
            }

            &.ghost-btn {
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid var(--border-line, rgba(255, 255, 255, 0.1));
              color: var(--text-secondary, #cbd5e1);

              &:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #ffffff;
                border-color: rgba(255, 255, 255, 0.2);
                transform: translateY(-1px);
              }
            }

            &.copy-btn {
              background: rgba(255, 255, 255, 0.03);
              border: 1px dashed var(--border-line, rgba(255, 255, 255, 0.15));
              color: var(--text-muted, #94a3b8);

              &:hover {
                color: #ffffff;
                border-color: var(--p-primary, #6366f1);
              }
            }
          }
        }
      }
    }

    @media (max-width: 768px) {
      .hero-section .hero-inner {
        flex-direction: column;
        text-align: center;
        gap: 1.5rem;

        .hero-highlights-strip, .hero-actions-row {
          justify-content: center;
        }
      }
    }

    /* ---------------------------------------------------------
       CARD GLOW & GENERAL CONTAINERS
       --------------------------------------------------------- */
    .card-glow {
      background: var(--card-bg, rgba(17, 24, 39, 0.7));
      border: 1px solid var(--border-line, rgba(255, 255, 255, 0.08));
      border-radius: 14px;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        border-color: var(--card-border-hover, rgba(99, 102, 241, 0.35));
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 15px rgba(99, 102, 241, 0.08);
      }
    }

    /* ---------------------------------------------------------
       ABOUT SECTION
       --------------------------------------------------------- */
    .about-card {
      padding: 2rem;
      position: relative;

      .about-quote-mark {
        font-family: Georgia, serif;
        font-size: 3.5rem;
        line-height: 1;
        color: var(--p-primary, #6366f1);
        opacity: 0.3;
        margin-bottom: -1rem;
      }

      .about-text {
        font-size: 1.0625rem;
        line-height: 1.75;
        color: var(--text-secondary, #cbd5e1);
      }
    }

    /* ---------------------------------------------------------
       SKILLS SECTION
       --------------------------------------------------------- */
    .skills-categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .skill-category-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, var(--p-primary, #6366f1), transparent);
      }

      .category-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.25rem;

        .category-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--p-primary, #818cf8);

          .category-name {
            font-size: 0.9375rem;
            font-weight: 700;
            color: var(--heading-color, #ffffff);
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }
        }

        .item-count-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6875rem;
          color: var(--text-muted, #94a3b8);
          background: rgba(255, 255, 255, 0.05);
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
        }
      }

      .skill-chips-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;

        .skill-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.3125rem 0.6875rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-line, rgba(255, 255, 255, 0.08));
          border-radius: 6px;
          transition: all 0.2s ease;

          &:hover {
            transform: translateY(-2px);
            background: rgba(99, 102, 241, 0.12);
            border-color: var(--p-primary, #6366f1);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
          }

          .skill-name {
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--text-secondary, #e2e8f0);
          }

          .skill-level-badge {
            font-size: 0.625rem;
            font-weight: 600;
            padding: 0.0625rem 0.3125rem;
            border-radius: 4px;
            text-transform: uppercase;

            &.level-expert {
              background: rgba(16, 185, 129, 0.15);
              color: #10b981;
            }

            &.level-advanced {
              background: rgba(99, 102, 241, 0.15);
              color: #818cf8;
            }

            &.level-intermediate {
              background: rgba(245, 158, 11, 0.15);
              color: #f59e0b;
            }
          }
        }
      }
    }

    /* ---------------------------------------------------------
       CAREER EXPERIENCE TIMELINE
       --------------------------------------------------------- */
    .timeline-container {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      padding-left: 2rem;

      .timeline-spine {
        position: absolute;
        left: 7px;
        top: 10px;
        bottom: 10px;
        width: 2px;
        background: linear-gradient(180deg, var(--p-primary, #6366f1) 0%, rgba(99, 102, 241, 0.1) 100%);
      }

      .timeline-card-wrapper {
        position: relative;

        .timeline-node {
          position: absolute;
          left: -2rem;
          top: 1.5rem;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--canvas-bg, #090d16);
          border: 2px solid var(--p-primary, #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;

          .node-core {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--p-primary, #6366f1);
          }

          &.current {
            border-color: #10b981;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);

            .node-core {
              background: #10b981;
            }
          }
        }

        .timeline-card {
          padding: 1.75rem;

          .card-top-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 0.75rem;
            margin-bottom: 0.75rem;

            .job-title {
              font-size: 1.25rem;
              font-weight: 800;
              color: var(--heading-color, #ffffff);
              margin-bottom: 0.25rem;
            }

            .company-sub-row {
              display: flex;
              align-items: center;
              gap: 0.375rem;
              font-size: 0.9375rem;

              .company-name {
                color: var(--p-primary, #818cf8);
                font-weight: 600;
              }

              .location-dot {
                color: var(--text-muted, #64748b);
              }

              .location-text {
                display: inline-flex;
                align-items: center;
                gap: 0.25rem;
                color: var(--text-muted, #94a3b8);
                font-size: 0.8125rem;
              }
            }

            .dates-pill {
              font-family: 'JetBrains Mono', monospace;
              font-size: 0.75rem;
              font-weight: 500;
              color: var(--text-muted, #94a3b8);
              background: rgba(255, 255, 255, 0.05);
              padding: 0.25rem 0.625rem;
              border-radius: 6px;

              &.current-date {
                color: #10b981;
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid rgba(16, 185, 129, 0.25);
              }
            }
          }

          .role-summary {
            font-size: 0.9375rem;
            color: var(--text-secondary, #cbd5e1);
            margin-bottom: 1rem;
            line-height: 1.6;
          }

          .responsibilities-list {
            list-style: none;
            padding: 0;
            margin: 0 0 1.25rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;

            .resp-item {
              display: flex;
              align-items: flex-start;
              gap: 0.625rem;
              font-size: 0.875rem;
              line-height: 1.5;
              color: var(--text-secondary, #94a3b8);

              .bullet-arrow {
                color: var(--p-primary, #6366f1);
                font-weight: 700;
                font-size: 0.9375rem;
                line-height: 1.2;
              }
            }
          }

          .card-tech-row {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.375rem;
            padding-top: 0.875rem;
            border-top: 1px solid var(--border-line, rgba(255, 255, 255, 0.06));

            .tech-label {
              font-size: 0.6875rem;
              font-weight: 600;
              color: var(--text-muted, #64748b);
              text-transform: uppercase;
              margin-right: 0.25rem;
            }

            .mini-tech-pill {
              font-family: 'JetBrains Mono', monospace;
              font-size: 0.6875rem;
              padding: 0.125rem 0.5rem;
              background: rgba(99, 102, 241, 0.1);
              color: #a5b4fc;
              border-radius: 4px;
            }
          }
        }
      }
    }

    /* ---------------------------------------------------------
       PROJECTS SECTION
       --------------------------------------------------------- */
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
      gap: 1.5rem;
    }

    .project-card {
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      position: relative;

      &.featured-card {
        border-color: rgba(99, 102, 241, 0.35);
        background: linear-gradient(180deg, rgba(99, 102, 241, 0.07) 0%, var(--card-bg, rgba(17, 24, 39, 0.7)) 40%);
      }

      .proj-card-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;

        .proj-title-group {
          display: flex;
          align-items: center;
          gap: 0.625rem;

          .proj-icon-box {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: rgba(99, 102, 241, 0.15);
            color: var(--p-primary, #6366f1);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .proj-name {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--heading-color, #ffffff);
          }
        }

        .featured-badge {
          font-size: 0.6875rem;
          font-weight: 700;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.25);
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
        }
      }

      .proj-role-tag {
        font-size: 0.75rem;
        color: var(--p-primary, #818cf8);
        font-weight: 500;
        margin-bottom: 0.75rem;
      }

      .proj-description {
        font-size: 0.875rem;
        line-height: 1.6;
        color: var(--text-secondary, #94a3b8);
        margin-bottom: 1.25rem;
        flex: 1;
      }

      .proj-tech-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
        margin-bottom: 1.25rem;

        .proj-tag {
          font-size: 0.6875rem;
          font-family: 'JetBrains Mono', monospace;
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-secondary, #cbd5e1);
          padding: 0.125rem 0.5rem;
          border-radius: 4px;
        }
      }

      .proj-card-footer {
        display: flex;
        gap: 0.625rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border-line, rgba(255, 255, 255, 0.06));

        .proj-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.4rem 0.875rem;
          border-radius: 6px;
          text-decoration: none;
          transition: all 0.2s ease;

          &.primary {
            background: var(--p-primary, #6366f1);
            color: #ffffff;

            &:hover {
              opacity: 0.9;
              transform: translateY(-1px);
            }
          }

          &.secondary {
            background: rgba(255, 255, 255, 0.06);
            color: var(--text-secondary, #cbd5e1);

            &:hover {
              background: rgba(255, 255, 255, 0.12);
              color: #ffffff;
              transform: translateY(-1px);
            }
          }
        }
      }
    }

    /* ---------------------------------------------------------
       EDUCATION & CERTIFICATIONS
       --------------------------------------------------------- */
    .education-grid, .certs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
      gap: 1.25rem;
    }

    .edu-card, .cert-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .edu-card-top, .cert-top {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;

        .edu-icon-circle, .cert-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(99, 102, 241, 0.12);
          color: var(--p-primary, #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .edu-heading, .cert-info {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;

          .edu-degree, .cert-name {
            font-size: 1rem;
            font-weight: 700;
            color: var(--heading-color, #ffffff);
            line-height: 1.3;
          }

          .edu-inst, .cert-issuer {
            font-size: 0.8125rem;
            color: var(--p-primary, #818cf8);
            font-weight: 500;
          }
        }
      }

      .edu-card-meta, .cert-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 0.5rem;
        font-size: 0.75rem;
        color: var(--text-muted, #94a3b8);
        padding-top: 0.5rem;
        border-top: 1px solid var(--border-line, rgba(255, 255, 255, 0.05));

        .edu-grade-pill {
          font-family: 'JetBrains Mono', monospace;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          padding: 0.125rem 0.5rem;
          border-radius: 4px;
        }

        .cert-link {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--p-primary, #818cf8);
          text-decoration: none;
          font-weight: 600;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .edu-field-text {
        font-size: 0.75rem;
        color: var(--text-muted, #64748b);
      }
    }

    /* ---------------------------------------------------------
       CONTACT BANNER
       --------------------------------------------------------- */
    .contact-banner {
      position: relative;
      overflow: hidden;
      padding: 3.5rem 2rem;
      border-radius: 20px;
      text-align: center;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%);

      .contact-mesh-glow {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
        pointer-events: none;
      }

      .contact-content {
        position: relative;
        z-index: 1;
        max-width: 600px;
        margin: 0 auto;

        .contact-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--p-primary, #6366f1);
          letter-spacing: 0.1em;
          display: block;
          margin-bottom: 0.5rem;
        }

        .contact-heading {
          font-size: 2rem;
          font-weight: 800;
          color: var(--heading-color, #ffffff);
          line-height: 1.25;
          margin-bottom: 0.75rem;
        }

        .contact-subtitle {
          font-size: 0.9375rem;
          color: var(--text-secondary, #cbd5e1);
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .contact-buttons-group {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;

          .contact-action-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.625rem 1.25rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s ease;

            &.primary {
              background: var(--p-primary, #6366f1);
              color: #ffffff;
              box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);

              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
              }
            }

            &.copy {
              background: rgba(255, 255, 255, 0.08);
              border: 1px solid var(--border-line, rgba(255, 255, 255, 0.1));
              color: var(--text-secondary, #cbd5e1);

              &:hover {
                background: rgba(255, 255, 255, 0.15);
                color: #ffffff;
              }
            }

            &.secondary {
              background: rgba(255, 255, 255, 0.06);
              border: 1px solid var(--border-line, rgba(255, 255, 255, 0.1));
              color: var(--text-secondary, #cbd5e1);

              &:hover {
                background: rgba(255, 255, 255, 0.12);
                color: #ffffff;
                transform: translateY(-2px);
              }
            }
          }
        }
      }
    }

    /* ---------------------------------------------------------
       PORTFOLIO FOOTER
       --------------------------------------------------------- */
    .portfolio-footer {
      border-top: 1px solid var(--border-line, rgba(255, 255, 255, 0.08));
      padding: 2.5rem 1.5rem;
      background: var(--footer-bg, rgba(9, 13, 22, 0.5));

      .footer-inner {
        max-width: 1040px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
        font-size: 0.8125rem;
        color: var(--text-muted, #64748b);

        .footer-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;

          .footer-brand {
            font-weight: 700;
            color: var(--heading-color, #ffffff);
          }
        }

        .footer-right {
          display: flex;
          align-items: center;
          gap: 0.375rem;

          .footer-brand-link {
            font-weight: 700;
            color: var(--p-primary, #6366f1);
            text-decoration: none;

            &:hover {
              text-decoration: underline;
            }
          }
        }
      }
    }

    /* ---------------------------------------------------------
       THEME OVERRIDES
       --------------------------------------------------------- */

    /* 1. DEVELOPER (Default modern dark engineering) */
    .theme-developer {
      --canvas-bg: #090d16;
      --canvas-text: #f8fafc;
      --heading-color: #ffffff;
      --card-bg: rgba(17, 24, 39, 0.75);
      --border-line: rgba(255, 255, 255, 0.08);
      --ambient-glow-color: rgba(99, 102, 241, 0.18);
      --card-border-hover: rgba(99, 102, 241, 0.4);
    }

    /* 2. MINIMAL (Recruiter-focused, clean Swiss layout) */
    .theme-minimal {
      --canvas-bg: #ffffff;
      --canvas-text: #1f2937;
      --heading-color: #111827;
      --card-bg: #ffffff;
      --border-line: #e5e7eb;
      --ambient-glow-color: rgba(0, 0, 0, 0.02);
      --card-border-hover: #111827;
      --nav-bg: rgba(255, 255, 255, 0.9);
      --text-secondary: #4b5563;
      --text-muted: #6b7280;

      .hero-name {
        background: none;
        -webkit-text-fill-color: initial;
        color: #111827;
      }

      .card-glow {
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }

      .hero-avatar-init {
        border-radius: 12px;
        background: #111827;
      }

      .hero-avatar-img {
        border-radius: 12px;
      }

      .contact-banner {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
      }

      .portfolio-footer {
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
      }
    }

    /* 3. EXECUTIVE (Midnight Navy, Slate & Regal Blue) */
    .theme-executive {
      --canvas-bg: #0b1120;
      --canvas-text: #f8fafc;
      --heading-color: #f1f5f9;
      --card-bg: #131c31;
      --border-line: rgba(255, 255, 255, 0.09);
      --ambient-glow-color: rgba(56, 189, 248, 0.14);
      --card-border-hover: rgba(56, 189, 248, 0.4);

      h1, h2, h3, h4 {
        font-family: 'Playfair Display', Georgia, serif;
      }
    }

    /* 4. ELEGANT (Editorial, Warm Paper & Sophisticated Typography) */
    .theme-elegant {
      --canvas-bg: #faf8f5;
      --canvas-text: #292524;
      --heading-color: #1c1917;
      --card-bg: #ffffff;
      --border-line: #e7e5e4;
      --ambient-glow-color: rgba(180, 83, 9, 0.06);
      --card-border-hover: #b45309;
      --nav-bg: rgba(250, 248, 245, 0.9);
      --text-secondary: #57534e;
      --text-muted: #78716c;

      h1, h2, h3, h4 {
        font-family: 'Playfair Display', Georgia, serif;
      }

      .hero-name {
        background: none;
        -webkit-text-fill-color: initial;
        color: #1c1917;
      }

      .contact-banner {
        background: #f5f5f4;
        border: 1px solid #e7e5e4;
      }

      .portfolio-footer {
        background: #f5f5f4;
        border-top: 1px solid #e7e5e4;
      }
    }

    /* ---------------------------------------------------------
       KEYFRAME ANIMATIONS
       --------------------------------------------------------- */
    @keyframes pulse-green {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.15); }
    }

    /* ---------------------------------------------------------
       RESPONSIVE ADAPTATIONS (TABLET & MOBILE)
       --------------------------------------------------------- */
    @media (max-width: 768px) {
      .canvas-content {
        padding: 1.5rem 1rem 3rem;
      }

      .p-section {
        margin-bottom: 3rem;
      }

      .section-header {
        margin-bottom: 1.5rem;
      }

      .p-nav-bar {
        top: 0.5rem;
        margin: 0.5rem auto 0;
        padding: 0 0.75rem;

        .nav-inner {
          padding: 0.5rem 0.875rem;
          gap: 0.5rem;
        }

        .nav-links {
          display: none;
        }

        .nav-title-tiny {
          display: none;
        }

        .print-btn {
          display: none !important;
        }

        .btn-nav-action span {
          display: none;
        }

        .btn-nav-primary {
          padding: 0.35rem 0.65rem;
          font-size: 0.72rem;
        }
      }

      .hero-section {
        padding: 1.5rem 0 0.5rem;

        .hero-inner {
          flex-direction: column;
          text-align: center;
          gap: 1.5rem;

          .hero-highlights-strip, .hero-actions-row {
            justify-content: center;
          }
        }

        .hero-avatar-wrapper {
          .hero-avatar-init, .hero-avatar-img {
            width: 100px;
            height: 100px;
            border-radius: 24px;
            font-size: 2.25rem;
          }
        }

        .hero-text-block {
          .hero-name {
            font-size: clamp(2rem, 7vw, 2.75rem);
          }

          .hero-pro-title {
            font-size: 1.0625rem;
            margin-bottom: 1rem;
          }
        }
      }

      .timeline-container {
        padding-left: 1.25rem;
        gap: 1.5rem;

        .timeline-spine {
          left: 5px;
        }

        .timeline-card-wrapper {
          .timeline-node {
            left: -1.25rem;
            width: 12px;
            height: 12px;
            top: 1.25rem;

            .node-core {
              width: 4px;
              height: 4px;
            }
          }

          .timeline-card {
            padding: 1.25rem 1rem;
          }
        }
      }

      .projects-grid {
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }

      .skills-categories-grid {
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }

      .education-grid, .certs-grid {
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }

      .contact-banner {
        padding: 2.25rem 1.25rem;

        .contact-heading {
          font-size: 1.5rem;
        }

        .contact-subtitle {
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .contact-buttons-group {
          flex-direction: column;
          width: 100%;

          .contact-action-btn {
            width: 100%;
            justify-content: center;
            box-sizing: border-box;
          }
        }
      }

      .portfolio-footer {
        padding: 1.75rem 1rem;

        .footer-inner {
          flex-direction: column;
          text-align: center;
          gap: 0.75rem;
        }
      }
    }

    @media (max-width: 480px) {
      .hero-actions-row {
        flex-direction: column;
        width: 100%;

        .hero-btn {
          width: 100%;
          justify-content: center;
          box-sizing: border-box;
        }
      }
    }

    /* ---------------------------------------------------------
       PRINT MODE OPTIMIZATIONS
       --------------------------------------------------------- */
    @media print {
      .p-nav-bar, .canvas-ambient-glow, .hero-actions-row, .proj-card-footer, .contact-buttons-group, .print-btn {
        display: none !important;
      }

      .portfolio-canvas {
        background: #ffffff !important;
        color: #000000 !important;
        padding: 0 !important;
      }

      .hero-name {
        color: #000000 !important;
        -webkit-text-fill-color: initial !important;
      }

      .card-glow {
        background: transparent !important;
        border: 1px solid #cccccc !important;
        box-shadow: none !important;
      }

      .p-section {
        margin-bottom: 2rem !important;
        page-break-inside: avoid;
      }
    }
  `]
})
export class PortfolioRendererComponent {
  data = input<Portfolio | PublicPortfolio | null>(null);
  notify = inject(NotificationService, { optional: true });

  defaultOrder = ['hero', 'about', 'skills', 'experience', 'projects', 'education', 'certifications', 'contact'];
  currentYear = new Date().getFullYear();
  copiedEmail = signal<boolean>(false);

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

  getCategoryIcon(category: string): string {
    const c = category.toLowerCase();
    if (c.includes('backend') || c.includes('server') || c.includes('cloud')) return 'database';
    if (c.includes('frontend') || c.includes('ui') || c.includes('web')) return 'layout';
    if (c.includes('database') || c.includes('data')) return 'database';
    if (c.includes('devops') || c.includes('ci/cd') || c.includes('deploy')) return 'terminal';
    if (c.includes('tool') || c.includes('developer')) return 'settings';
    if (c.includes('security')) return 'shield';
    return 'code';
  }

  copyEmail(email: string): void {
    if (!email) return;
    navigator.clipboard?.writeText(email).then(() => {
      this.copiedEmail.set(true);
      this.notify?.success('Email copied to clipboard!');
      setTimeout(() => this.copiedEmail.set(false), 2500);
    }).catch(() => {
      this.copiedEmail.set(true);
      setTimeout(() => this.copiedEmail.set(false), 2500);
    });
  }

  scrollToSection(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  printPortfolio(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}

