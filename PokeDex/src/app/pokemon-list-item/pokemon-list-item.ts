import { Component, OnInit, ChangeDetectionStrategy, signal, computed, inject, HostListener } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { PokemonDataService } from '../data.service';
import { PokemonCard } from '../pokemon-card/pokemon-card';
import { PokemonDetailPanel } from '../pokemon-detail-panel/pokemon-detail-panel';
import { TypeCard } from '../type-card/type-card';
import { Pokemon, PokemonSpecies } from '../pokemon.types';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-pokemon-list-item',
  imports: [PokemonCard, PokemonDetailPanel, TypeCard, TitleCasePipe],
  templateUrl: './pokemon-list-item.html',
  styleUrl: './pokemon-list-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PokemonList implements OnInit {
  private readonly _pokemons = signal<Pokemon[]>([]);
  private readonly _selectedPokemon = signal<Pokemon | null>(null);
  private readonly _searchTerm = signal<string>('');
  private readonly _selectedType = signal<string>('');
  private readonly _isTypeDropdownOpen = signal<boolean>(false);
  private readonly pokemonShinyStatus = new Map<number, boolean>();

  private readonly typeGradients: Record<string, string> = {
    'normal': 'linear-gradient(135deg, #A8A878 0%, #C6C6A7 25%, #DADAB8 50%, #E6E6C7 75%, #F2F2D6 100%)',
    'fire': 'linear-gradient(135deg, #F08030 0%, #F8983A 25%, #F8A848 50%, #F8B856 75%, #F8C864 100%)',
    'water': 'linear-gradient(135deg, #6890F0 0%, #7A9FF8 25%, #8CAEF8 50%, #9EBDF8 75%, #B0CCF8 100%)',
    'grass': 'linear-gradient(135deg, #78C850 0%, #8AD860 25%, #9CE870 50%, #AEF880 75%, #C0F890 100%)',
    'flying': 'linear-gradient(135deg, #A890F0 0%, #B8A0F8 25%, #C8B0F8 50%, #D8C0F8 75%, #E8D0F8 100%)',
    'fighting': 'linear-gradient(135deg, #C03028 0%, #D04038 25%, #E05048 50%, #F06058 75%, #F07068 100%)',
    'poison': 'linear-gradient(135deg, #A040A0 0%, #B050B0 25%, #C060C0 50%, #D070D0 75%, #E080E0 100%)',
    'electric': 'linear-gradient(135deg, #F8D030 0%, #F8E040 25%, #F8F050 50%, #F8F860 75%, #F8F870 100%)',
    'ground': 'linear-gradient(135deg, #E0C068 0%, #E8C878 25%, #F0D088 50%, #F8D898 75%, #F8E0A8 100%)',
    'rock': 'linear-gradient(135deg, #B8A038 0%, #C8B048 25%, #D8C058 50%, #E8D068 75%, #F8E078 100%)',
    'psychic': 'linear-gradient(135deg, #F85888 0%, #F86898 25%, #F878A8 50%, #F888B8 75%, #F898C8 100%)',
    'ice': 'linear-gradient(135deg, #98D8D8 0%, #A8E8E8 25%, #B8F8F8 50%, #C8F8F8 75%, #D8F8F8 100%)',
    'bug': 'linear-gradient(135deg, #A8B820 0%, #B8C830 25%, #C8D840 50%, #D8E850 75%, #E8F860 100%)',
    'ghost': 'linear-gradient(135deg, #705898 0%, #8068A8 25%, #9078B8 50%, #A088C8 75%, #B098D8 100%)',
    'dragon': 'linear-gradient(135deg, #7038F8 0%, #8048F8 25%, #9058F8 50%, #A068F8 75%, #B078F8 100%)',
    'dark': 'linear-gradient(135deg, #705848 0%, #806858 25%, #907868 50%, #A08878 75%, #B09888 100%)',
    'steel': 'linear-gradient(135deg, #B8B8D0 0%, #C8C8E0 25%, #D8D8F0 50%, #E8E8F8 75%, #F8F8F8 100%)',
    'fairy': 'linear-gradient(135deg, #EE99AC 0%, #F8A9BC 25%, #F8B9CC 50%, #F8C9DC 75%, #F8D9EC 100%)'
  };

  private readonly dataService = inject(PokemonDataService);

  // Computed signals for template access
  readonly pokemons = this._pokemons.asReadonly();
  readonly selectedPokemon = this._selectedPokemon.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();
  readonly selectedType = this._selectedType.asReadonly();
  readonly isTypeDropdownOpen = this._isTypeDropdownOpen.asReadonly();

  // Available types for filter
  readonly availableTypes = [
    'normal', 'fire', 'water', 'grass', 'flying', 'fighting', 
    'poison', 'electric', 'ground', 'rock', 'psychic', 'ice', 'bug', 
    'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  // Computed signal for filtered pokemon
  readonly filteredPokemons = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const selectedType = this.selectedType();
    const allPokemons = this.pokemons();
    
    let filtered = allPokemons;
    
    // Filter by type if selected
    if (selectedType && selectedType !== 'all') {
      filtered = filtered.filter(pokemon => 
        pokemon.types.some(type => type.type.name === selectedType)
      );
    }
    
    // Filter by search term if provided
    if (search) {
      filtered = filtered.filter(pokemon => 
        pokemon.name.toLowerCase().includes(search) ||
        pokemon.id.toString().includes(search)
      );
    }
    
    return filtered;
  });

  ngOnInit(): void {
    this.dataService.getPokemon()
    .subscribe((response: unknown) => {
      console.log(response);
      
      // Create an array of observables for all Pokemon data calls
      const pokemonObservables = (response as { results: Array<{ name: string }> }).results.map((pokemon) => 
        this.dataService.getAllData(pokemon.name)
      );
      
      // Wait for all calls to complete, then sort
      forkJoin(pokemonObservables).subscribe((pokemonData: unknown) => {
        const sortedPokemon = (pokemonData as Pokemon[]).sort((poke_a: Pokemon, poke_b: Pokemon) => {
          return poke_a.id - poke_b.id; // Sort by ID ascending
        });
        
        // Fetch species data for each Pokemon
        this.fetchSpeciesData(sortedPokemon);
      });
    });
  }

  private fetchSpeciesData(pokemons: Pokemon[]): void {
    // Create an array of observables for species data calls
    const speciesObservables = pokemons.map((pokemon) => 
      this.dataService.getSpeciesData(pokemon.species.url)
    );
    
    // Wait for all species calls to complete
    forkJoin(speciesObservables).subscribe((speciesData: PokemonSpecies[]) => {
      // Combine Pokemon data with species data
      const pokemonsWithSpecies = pokemons.map((pokemon, index) => ({
        ...pokemon,
        species_details: speciesData[index]
      }));
      
      this._pokemons.set(pokemonsWithSpecies);
      console.log('Pokemon with species data:', pokemonsWithSpecies);
    });
  }

  onPokemonHover(pokemon: Pokemon): void {
    this._selectedPokemon.set(pokemon);
  }

  onPokemonLeave(): void {
    // this._selectedPokemon.set(null);
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this._searchTerm.set(target.value);
  }

  toggleTypeDropdown(): void {
    this._isTypeDropdownOpen.update(open => !open);
  }

  onTypeSelect(type: string): void {
    if (this.selectedType() === type) {
      // If clicking the same type, deselect it
      this._selectedType.set('');
    } else {
      this._selectedType.set(type);
    }
    this._isTypeDropdownOpen.set(false);
  }

  closeTypeDropdown(): void {
    this._isTypeDropdownOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.type-dropdown')) {
      this._isTypeDropdownOpen.set(false);
    }
  }

  getPokemonShinyStatus(pokemonId: number): boolean {
    if (!this.pokemonShinyStatus.has(pokemonId)) {
      this.pokemonShinyStatus.set(pokemonId, Math.random() < 0.1);
    }
    return this.pokemonShinyStatus.get(pokemonId) || false;
  }

  getBackgroundGradient(): string {
    const selectedPokemon = this.selectedPokemon();
    if (!selectedPokemon || !selectedPokemon.types || selectedPokemon.types.length === 0) {
      return 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
    }

    if (selectedPokemon.types.length === 1) {
      const typeName = selectedPokemon.types[0].type.name;
      return this.typeGradients[typeName] || this.typeGradients['normal'];
    }

    if (selectedPokemon.types.length === 2) {
      const type1 = selectedPokemon.types[0].type.name;
      const type2 = selectedPokemon.types[1].type.name;
      const gradient1 = this.typeGradients[type1] || this.typeGradients['normal'];
      const gradient2 = this.typeGradients[type2] || this.typeGradients['normal'];
      
      // Create a complex gradient that combines both types
      return `${gradient1}, ${gradient2}`;
    }

    return this.typeGradients['normal'];
  }
}
