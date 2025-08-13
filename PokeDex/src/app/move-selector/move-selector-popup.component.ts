import { Component, Input, Output, EventEmitter, signal, computed, inject, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { TypeCard } from '../type-card/type-card';
import { Pokemon } from '../pokemon.types';
import { HttpClient } from '@angular/common/http';
import { MoveCardComponent } from './move-card.component';

export interface MoveDetail {
  id: number;
  name: string;
  type: {
    name: string;
  };
  power: number | null;
  accuracy: number | null;
  pp: number;
  damage_class: {
    name: string;
  };
  effect_entries: Array<{
    effect: string;
    language: {
      name: string;
    };
  }>;
}

export interface FilteredMove {
  name: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  damageClass: string;
  effect: string;
}

@Component({
  selector: 'app-move-selector-popup',
  standalone: true,
  imports: [TitleCasePipe, TypeCard, MoveCardComponent],
  templateUrl: './move-selector-popup.component.html',
  styleUrls: ['./move-selector-popup.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoveSelectorPopupComponent implements OnInit, OnChanges {
  @Input() pokemon: Pokemon | null = null;
  @Input() selectedMoves: string[] = [];
  @Input() isVisible = false;
  @Output() movesSelected = new EventEmitter<string[]>();
  @Output() closePopup = new EventEmitter<void>();

  private readonly http = inject(HttpClient);

  private readonly _availableMoves = signal<FilteredMove[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _searchTerm = signal<string>('');
  private readonly _selectedType = signal<string>('all');
  private readonly _sortBy = signal<'name' | 'power' | 'accuracy' | 'pp'>('name');
  private readonly _sortDirection = signal<'asc' | 'desc'>('asc');
  private readonly _tempSelectedMoves = signal<string[]>([]);

  readonly availableMoves = this._availableMoves.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();
  readonly selectedType = this._selectedType.asReadonly();
  readonly sortBy = this._sortBy.asReadonly();
  readonly sortDirection = this._sortDirection.asReadonly();
  readonly tempSelectedMoves = this._tempSelectedMoves.asReadonly();

  readonly pokemonTypes = computed(() => {
    if (!this.pokemon?.types) return [];
    return this.pokemon.types.map(t => t.type.name);
  });

  readonly uniqueTypes = computed(() => {
    const types = new Set(this._availableMoves().map(move => move.type));
    return Array.from(types).sort();
  });

  readonly filteredAndSortedMoves = computed(() => {
    let moves = this._availableMoves();
    
    // Filter by search term
    const search = this._searchTerm().toLowerCase();
    if (search) {
      moves = moves.filter(move => 
        move.name.toLowerCase().includes(search) ||
        move.type.toLowerCase().includes(search) ||
        move.effect.toLowerCase().includes(search)
      );
    }

    // Filter by type
    if (this._selectedType() !== 'all') {
      moves = moves.filter(move => move.type === this._selectedType());
    }

    // Sort moves
    const sortBy = this._sortBy();
    const direction = this._sortDirection();
    
    moves = moves.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'power':
          aValue = a.power ?? -1;
          bValue = b.power ?? -1;
          break;
        case 'accuracy':
          aValue = a.accuracy ?? -1;
          bValue = b.accuracy ?? -1;
          break;
        case 'pp':
          aValue = a.pp;
          bValue = b.pp;
          break;
        case 'name':
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return moves;
  });

  ngOnInit(): void {
    if (this.pokemon && this.isVisible) {
      this.loadMoveDetails();
    }
    this._tempSelectedMoves.set([...this.selectedMoves]);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Check if pokemon or isVisible changed
    if ((changes['pokemon'] || changes['isVisible']) && this.pokemon && this.isVisible) {
      this.loadMoveDetails();
    }
    
    // Update temp selected moves if selectedMoves input changed
    if (changes['selectedMoves']) {
      this._tempSelectedMoves.set([...this.selectedMoves]);
    }
  }

  private async loadMoveDetails(): Promise<void> {
    if (!this.pokemon?.moves) return;

    this._isLoading.set(true);
    this._availableMoves.set([]);

    try {
      const movePromises = this.pokemon.moves.map(async (move) => {
        try {
          const response = await fetch(`https://pokeapi.co/api/v2/move/${move.move.name}`);
          if (!response.ok) {
            console.warn(`Failed to fetch move details for ${move.move.name}`);
            return null;
          }
          const moveDetail: MoveDetail = await response.json();
          
          const englishEffect = moveDetail.effect_entries.find(
            entry => entry.language.name === 'en'
          )?.effect || 'No description available';

          return {
            name: moveDetail.name,
            type: moveDetail.type.name,
            power: moveDetail.power,
            accuracy: moveDetail.accuracy,
            pp: moveDetail.pp,
            damageClass: moveDetail.damage_class.name,
            effect: englishEffect
          };
        } catch (error) {
          console.error(`Error fetching move ${move.move.name}:`, error);
          return null;
        }
      });

      const moveDetails = (await Promise.all(movePromises)).filter(Boolean) as FilteredMove[];
      // Remove duplicates based on move name
      const uniqueMoveDetails = Array.from(new Map(moveDetails.map(move => [move.name, move])).values());
      this._availableMoves.set(uniqueMoveDetails);
    } catch (error) {
      console.error('Error loading move details:', error);
    } finally {
      this._isLoading.set(false);
    }
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this._searchTerm.set(target.value);
  }

  onTypeFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this._selectedType.set(target.value);
  }

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this._sortBy.set(target.value as 'name' | 'power' | 'accuracy' | 'pp');
  }

  toggleSortDirection(): void {
    this._sortDirection.set(this._sortDirection() === 'asc' ? 'desc' : 'asc');
  }

  toggleMoveSelection(moveName: string): void {
    const current = this._tempSelectedMoves();
    if (current.includes(moveName)) {
      this._tempSelectedMoves.set(current.filter(m => m !== moveName));
    } else if (current.length < 4) {
      this._tempSelectedMoves.set([...current, moveName]);
    }
  }

  isMoveSelected(moveName: string): boolean {
    return this._tempSelectedMoves().includes(moveName);
  }

  canSelectMore(): boolean {
    return this._tempSelectedMoves().length < 4;
  }

  confirmSelection(): void {
    this.movesSelected.emit([...this._tempSelectedMoves()]);
    this.close();
  }

  close(): void {
    this._tempSelectedMoves.set([...this.selectedMoves]);
    this.closePopup.emit();
  }

  clearSelection(): void {
    this._tempSelectedMoves.set([]);
  }
}