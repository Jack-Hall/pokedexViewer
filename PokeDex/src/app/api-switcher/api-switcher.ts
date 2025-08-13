import { Component, inject } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { UnifiedDataService, ApiType } from '../unified-data.service';

@Component({
  selector: 'app-api-switcher',
  standalone: true,
  imports: [UpperCasePipe],
  template: `
    <div class="api-switcher">
      <select 
        [value]="dataService.currentApiType()"
        (change)="onApiChange($event)"
        class="api-select"
      >
        <option value="rest">REST API</option>
        <option value="graphql">GraphQL API</option>
      </select>
    </div>
  `,
  styles: [`
    .api-switcher {
      display: flex;
      align-items: center;
    }

    .api-select {
      padding: 0.2rem 0.4rem;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 4px;
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 0.7rem;
      cursor: pointer;
      outline: none;
      transition: border-color 0.2s ease;
      font-family: 'Press Start 2P', 'Courier New', monospace;
    }

    .api-select:hover {
      border-color: rgba(255, 255, 255, 0.5);
    }

    .api-select:focus {
      border-color: rgba(255, 255, 255, 0.8);
    }

    .api-select option {
      background-color: #2c3e50;
      color: white;
    }
  `]
})
export class ApiSwitcherComponent {
  readonly dataService = inject(UnifiedDataService);

  onApiChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value as ApiType;
    this.dataService.setApiType(value);
  }
} 