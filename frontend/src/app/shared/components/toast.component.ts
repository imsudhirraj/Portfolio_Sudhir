import { Component, inject } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="toast-container">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div class="toast" [class]="'toast-' + toast.type">
          <div class="toast-icon">
            @switch (toast.type) {
              @case ('success') { <app-icon name="check-circle" [size]="18" /> }
              @case ('error') { <app-icon name="x" [size]="18" /> }
              @case ('warning') { <app-icon name="shield" [size]="18" /> }
              @default { <app-icon name="sparkles" [size]="18" /> }
            }
          </div>
          <div class="toast-message">{{ toast.message }}</div>
          <button class="toast-close" (click)="notificationService.dismiss(toast.id)">
            <app-icon name="x" [size]="14" />
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      z-index: 9999;
      pointer-events: none;
    }

    .toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.25rem;
      border-radius: var(--radius-md);
      background: var(--bg-elevated);
      color: var(--text-primary);
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border-color);
      min-width: 300px;
      max-width: 440px;
      animation: toastIn 0.25s ease-out;

      &.toast-success {
        border-color: rgba(16, 185, 129, 0.4);
        .toast-icon { color: var(--success); }
      }

      &.toast-error {
        border-color: rgba(239, 68, 68, 0.4);
        .toast-icon { color: var(--error); }
      }

      &.toast-warning {
        border-color: rgba(245, 158, 11, 0.4);
        .toast-icon { color: var(--warning); }
      }

      &.toast-info {
        border-color: rgba(99, 102, 241, 0.4);
        .toast-icon { color: var(--accent-primary); }
      }
    }

    .toast-message {
      flex: 1;
      font-size: 0.875rem;
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem;
      border-radius: 4px;

      &:hover {
        color: var(--text-primary);
        background: rgba(255, 255, 255, 0.1);
      }
    }

    @keyframes toastIn {
      from {
        opacity: 0;
        transform: translateY(12px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `]
})
export class ToastComponent {
  notificationService = inject(NotificationService);
}
