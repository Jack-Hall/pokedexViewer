import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { FilteredMove } from './move-selector-popup.component';
import { TypeCard } from '../type-card/type-card';
import { input } from '@angular/core';

@Component({
  selector: 'app-move-card',
  standalone: true,
  imports: [TypeCard, TitleCasePipe],
  templateUrl: './move-card.component.html',
  styleUrls: ['./move-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoveCardComponent {
  move = input<FilteredMove>();
  isSelected = input<boolean>();
  canSelectMore = input<boolean>();

  toggleSelection(): void {
    // Emit an event or handle selection logic here
  }
}