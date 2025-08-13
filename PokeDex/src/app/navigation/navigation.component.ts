import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ApiSwitcherComponent } from '../api-switcher/api-switcher';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ApiSwitcherComponent],
  template: `
    <nav class="navigation">
      <div class="nav-links">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
          <span class="nav-icon">⚔️</span>
          Team Builder
        </a>
        <a routerLink="/pokemon-list" routerLinkActive="active">
          <span class="nav-icon">📋</span>
          Pokemon List
        </a>
      </div>
      <app-api-switcher></app-api-switcher>
    </nav>
  `,
  styles: [`
    .navigation {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      margin-bottom: 2rem;
      border-bottom: 2px solid #e0e0e0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 1rem 2rem;
      margin: 0 0 2rem 0;
    }

    .nav-links {
      display: flex;
      gap: 2rem;
    }

    .nav-links a {
      text-decoration: none;
      color: white;
      font-weight: 500;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .nav-links a:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .nav-links a.active {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.5);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .nav-icon {
      font-size: 1.2rem;
    }

    app-api-switcher {
      position: relative;
      z-index: 1000;
      max-width: 300px;
    }
  `]
})
export class NavigationComponent {
  // Navigation logic can be added here if needed
} 