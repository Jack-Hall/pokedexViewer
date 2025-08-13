import { Component, OnInit, ChangeDetectionStrategy, signal, computed, inject, OnDestroy } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UnifiedDataService, ApiType } from '../unified-data.service';
import { TeamBuilderService } from './team-builder.service';
import { ApiSwitcherComponent } from '../api-switcher/api-switcher';
import { TypeCard } from '../type-card/type-card';
import { MoveSelectorPopupComponent } from '../move-selector/move-selector-popup.component';
import { Pokemon } from '../pokemon.types';
import { Subject, takeUntil } from 'rxjs';

interface VirtualizedPokemon {
  id: number;
  name: string;
  url: string;
  detailedData?: Pokemon;
  isLoading?: boolean;
  isVisible?: boolean;
}

@Component({
  selector: 'app-team-builder',
  standalone: true,
  imports: [TitleCasePipe, RouterLink, RouterLinkActive, ApiSwitcherComponent, TypeCard, MoveSelectorPopupComponent],
  templateUrl: './team-builder.component.html',
  styleUrls: ['./team-builder.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamBuilderComponent implements OnInit, OnDestroy {
  private readonly dataService = inject(UnifiedDataService);
  readonly teamService = inject(TeamBuilderService);

  private readonly _pokemonList = signal<VirtualizedPokemon[]>([]);
  private readonly _searchTerm = signal<string>('');
  private readonly _isLoading = signal<boolean>(false);
  private readonly _hasError = signal<boolean>(false);
  private readonly _movePopupVisible = signal<boolean>(false);
  private readonly _selectedPokemonForMoves = signal<Pokemon | null>(null);
  private readonly destroy$ = new Subject<void>();

  readonly pokemonList = this._pokemonList.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly hasError = this._hasError.asReadonly();
  readonly movePopupVisible = this._movePopupVisible.asReadonly();
  readonly selectedPokemonForMoves = this._selectedPokemonForMoves.asReadonly();
  readonly teamStats = computed(() => this.teamService.getTeamStats());
  readonly currentTeam = computed(() => this.teamService.currentTeam());
  readonly teamPokemon = computed(() => this.currentTeam().pokemon || []);

  readonly filteredPokemons = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const allPokemons = this.pokemonList();
    
    if (!search) return allPokemons;
    
    return allPokemons.filter(pokemon => 
      pokemon.name.toLowerCase().includes(search) ||
      pokemon.id.toString().includes(search)
    );
  });

  ngOnInit(): void {
    // Set the API to use GraphQL for comprehensive data
    this.dataService.setApiType('graphql');
    this.loadPokemonData();
    
    // Listen for API type changes and reload data
    this.setupApiChangeListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupApiChangeListener(): void {
    // Create a subscription to watch for API changes
    this.dataService.apiTypeChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((apiType: ApiType) => {
        console.log('TeamBuilder: API type changed to:', apiType);
        // Only reload if this is not the initial load
        if (this._pokemonList().length > 0) {
          console.log('TeamBuilder: Reloading data for API:', apiType);
          this.loadPokemonData();
        }
      });
  }

  private loadPokemonData(): void {
    this._isLoading.set(true);
    this._hasError.set(false);
    console.log('TeamBuilder: Loading Pokemon data from shared service');
    
    this.dataService.getPokemon()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('TeamBuilder: Received Pokemon data', response);
          if (response.fullData) {
            // Use comprehensive data from GraphQL
            const pokemons = response.fullData.map((pokemon: any) => ({
              id: pokemon.id,
              name: pokemon.name,
              url: `https://pokeapi.co/api/v2/pokemon/${pokemon.id}/`,
              detailedData: pokemon,
              isLoading: false,
              isVisible: false
            }));
            this._pokemonList.set(pokemons);
            console.log('TeamBuilder: Set', pokemons.length, 'Pokemon with detailed data');
          } else {
            // Fallback to basic data for REST API
            const pokemons = response.results.map((pokemon: any, index: number) => ({
              id: index + 1,
              name: pokemon.name,
              url: pokemon.url,
              isLoading: false,
              isVisible: false
            }));
            this._pokemonList.set(pokemons);
            console.log('TeamBuilder: Set', pokemons.length, 'Pokemon with basic data');
          }
          this._isLoading.set(false);
        },
        error: (error) => {
          console.error('TeamBuilder: Error loading Pokemon data', error);
          this._hasError.set(true);
          this._isLoading.set(false);
        }
      });
  }

  retryLoad(): void {
    this.loadPokemonData();
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this._searchTerm.set(target.value);
  }

  updateTeamName(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.teamService.updateTeamName(target.value);
  }

  clearTeam(): void {
    this.teamService.clearTeam();
  }

  addPokemonToTeam(pokemon: VirtualizedPokemon): void {
    if (pokemon.detailedData) {
      this.teamService.addPokemonToTeam(pokemon.detailedData);
    }
  }

  removePokemonFromTeam(pokemonId: number): void {
    this.teamService.removePokemonFromTeam(pokemonId);
  }

  togglePokemonInTeam(pokemon: VirtualizedPokemon): void {
    if (this.isPokemonInTeam(pokemon.id)) {
      this.removePokemonFromTeam(pokemon.id);
    } else {
      this.addPokemonToTeam(pokemon);
    }
  }

  selectMove(pokemonId: number, moveName: string): void {
    this.teamService.selectMove(pokemonId, moveName);
  }

  removeMove(pokemonId: number, moveName: string): void {
    this.teamService.removeMove(pokemonId, moveName);
  }

  isPokemonInTeam(pokemonId: number): boolean {
    return this.teamPokemon().some(tp => tp.id === pokemonId);
  }

  isTeamFull(): boolean {
    return this.teamService.isTeamFull();
  }

  getAvailableMovesForPokemon(pokemonId: number): string[] {
    return this.teamService.getAvailableMovesForPokemon(pokemonId);
  }

  getPokemonSprite(pokemon: Pokemon): string {
    return pokemon.sprites?.front_default || 
           pokemon.sprites?.other?.['official-artwork']?.front_default || 
           'assets/pokemon-placeholder.png';
  }



  getEmptySlots(): number[] {
    const currentTeamSize = this.teamPokemon().length;
    const emptySlots = 6 - currentTeamSize;
    return Array.from({ length: emptySlots }, (_, i) => i);
  }

  openMoveSelector(pokemonId: number): void {
    const teamPokemon = this.teamPokemon().find(tp => tp.id === pokemonId);
    if (teamPokemon?.pokemon) {
      this._selectedPokemonForMoves.set(teamPokemon.pokemon);
      this._movePopupVisible.set(true);
    }
  }

  closeMoveSelector(): void {
    this._movePopupVisible.set(false);
    this._selectedPokemonForMoves.set(null);
  }

  onMovesSelected(selectedMoves: string[]): void {
    const pokemonId = this.selectedPokemonForMoves()?.id;
    if (!pokemonId) return;
    
    // Clear existing moves and add new ones
    const teamPokemon = this.teamPokemon().find(tp => tp.id === pokemonId);
    if (teamPokemon) {
      // Remove all existing moves
      teamPokemon.selectedMoves.forEach(move => {
        this.teamService.removeMove(pokemonId, move);
      });
      
      // Add selected moves
      selectedMoves.forEach(move => {
        this.teamService.selectMove(pokemonId, move);
      });
    }
    
    this.closeMoveSelector();
  }

  getCurrentSelectedMoves(): string[] {
    const pokemonId = this.selectedPokemonForMoves()?.id;
    return pokemonId ? this.teamService.getSelectedMovesForPokemon(pokemonId) : [];
  }
} 