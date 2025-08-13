import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, switchMap, BehaviorSubject, of, shareReplay } from 'rxjs';
import { Pokemon, PokemonSpecies } from './pokemon.types';
import { PokemonDataService } from './data.service';
import { GraphQLDataService, GraphQLResponse, PokemonListResponse, PokemonDetailResponse } from './graphql-data.service';

export type ApiType = 'rest' | 'graphql';

interface CachedPokemonData {
  results: any[];
  count: number;
  fullData?: Pokemon[];
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class UnifiedDataService {
  private readonly restService = inject(PokemonDataService);
  private readonly graphqlService = inject(GraphQLDataService);
  
  // Signal to control which API to use
  private readonly apiType = signal<ApiType>('rest');

  // BehaviorSubject to track API changes for components
  private readonly apiTypeSubject = new BehaviorSubject<ApiType>('rest');

  // Cache for Pokemon data
  private cachedPokemonData: CachedPokemonData | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Shared observable for Pokemon data
  private pokemonData$: Observable<any> | null = null;

  // Computed signal to expose the current API type
  readonly currentApiType = this.apiType.asReadonly();

  // Observable for API changes
  readonly apiTypeChanges = this.apiTypeSubject.asObservable();

  // Method to switch API type
  setApiType(type: ApiType): void {
    const previousType = this.apiType();
    this.apiType.set(type);
    this.apiTypeSubject.next(type);
    
    // Clear cache if API type changes
    if (previousType !== type) {
      this.clearCache();
    }
  }

  // Method to toggle between APIs
  toggleApiType(): void {
    const newType = this.apiType() === 'rest' ? 'graphql' : 'rest';
    this.setApiType(newType);
  }

  // Clear the cache
  private clearCache(): void {
    this.cachedPokemonData = null;
    this.pokemonData$ = null;
  }

  // Check if cache is valid
  private isCacheValid(): boolean {
    if (!this.cachedPokemonData) return false;
    const now = Date.now();
    return (now - this.cachedPokemonData.timestamp) < this.CACHE_DURATION;
  }

  getPokemon(): Observable<any> {
    // Return cached data if valid
    if (this.isCacheValid() && this.cachedPokemonData) {
      console.log('UnifiedDataService: Returning cached Pokemon data');
      return of(this.cachedPokemonData);
    }

    // Create shared observable if not exists
    if (!this.pokemonData$) {
      console.log('UnifiedDataService: Creating new Pokemon data observable');
      this.pokemonData$ = this.fetchPokemonData().pipe(
        shareReplay(1) // Share the result with multiple subscribers
      );
    }

    return this.pokemonData$;
  }

  private fetchPokemonData(): Observable<any> {
    const apiType = this.apiType();
    console.log('UnifiedDataService: Fetching Pokemon data using', apiType, 'API');
    
    if (apiType === 'graphql') {
      return this.graphqlService.getPokemonList().pipe(
        map((response: GraphQLResponse<PokemonListResponse>) => {
          const data = {
            results: response.data.pokemon.map(pokemon => ({
              name: pokemon.name,
              url: `https://pokeapi.co/api/v2/pokemon/${pokemon.id}/`
            })),
            count: response.data.pokemon.length,
            fullData: response.data.pokemon.map(pokemon => this.transformGraphQLPokemon(pokemon)),
            timestamp: Date.now()
          };
          
          // Cache the data
          this.cachedPokemonData = data;
          return data;
        })
      );
    } else {
      return this.restService.getPokemon().pipe(
        map((response: any) => {
          const data = {
            ...response,
            timestamp: Date.now()
          };
          
          // Cache the data
          this.cachedPokemonData = data;
          return data;
        })
      );
    }
  }

  // Force refresh the data (clears cache and fetches new data)
  refreshPokemonData(): Observable<any> {
    this.clearCache();
    return this.getPokemon();
  }

  getAllData(pokemonName: string): Observable<Pokemon> {
    const apiType = this.apiType();
            if (apiType === 'graphql') {
          return this.graphqlService.getPokemonDetail(pokemonName).pipe(
            map((response: GraphQLResponse<PokemonDetailResponse>) => {
              const pokemonData = response.data.pokemon[0];
              if (!pokemonData) {
                throw new Error(`Pokemon ${pokemonName} not found`);
              }

                             // Transform GraphQL response to match REST Pokemon interface
               const sprites = pokemonData.pokemonsprites[0]?.sprites || {};
              
              return {
                id: pokemonData.id,
                name: pokemonData.name,
                height: pokemonData.height,
                weight: pokemonData.weight,
                base_experience: pokemonData.base_experience,
                sprites: sprites,
                abilities: pokemonData.pokemonabilities.map((ability: any) => ({
                  ability: {
                    name: ability.ability.name,
                    url: `https://pokeapi.co/api/v2/ability/${ability.ability.name}/`
                  },
                  is_hidden: ability.is_hidden,
                  slot: ability.slot
                })),
                stats: pokemonData.pokemonstats.map((stat: any) => ({
                  base_stat: stat.base_stat,
                  effort: stat.effort,
                  stat: {
                    name: stat.stat.name,
                    url: `https://pokeapi.co/api/v2/stat/${stat.stat.name}/`
                  }
                })),
                types: pokemonData.pokemontypes.map((type: any) => ({
                  slot: type.slot,
                  type: {
                    name: type.type.name,
                    url: `https://pokeapi.co/api/v2/type/${type.type.name}/`
                  }
                })),
                moves: pokemonData.pokemonmoves.map((move: any) => ({
                  move: {
                    name: move.move.name,
                    url: `https://pokeapi.co/api/v2/move/${move.move.name}/`
                  },
                  version_group_details: []
                })),
                species: {
                  name: pokemonData.pokemonspecy.name,
                  url: `https://pokeapi.co/api/v2/pokemon-species/${pokemonData.pokemonspecy.id}/`
                },
                // Add other required properties with default values
                cries: { latest: '', legacy: '' },
                forms: [],
                game_indices: [],
                held_items: [],
                is_default: true,
                location_area_encounters: '',
                order: pokemonData.id,
                past_abilities: [],
                past_types: [],
                species_details: {
                  id: pokemonData.pokemonspecy.id,
                  name: pokemonData.pokemonspecy.name,
                  base_happiness: pokemonData.pokemonspecy.base_happiness,
                  capture_rate: pokemonData.pokemonspecy.capture_rate,
                  is_baby: pokemonData.pokemonspecy.is_baby,
                  is_legendary: pokemonData.pokemonspecy.is_legendary,
                  is_mythical: pokemonData.pokemonspecy.is_mythical,
                  flavor_text_entries: pokemonData.pokemonspecy.pokemonspeciesflavortexts.map((entry: any) => ({
                    flavor_text: entry.flavor_text,
                    language: { name: entry.language.name, url: '' },
                    version: { name: '', url: '' }
                  })),
                  // Add other required properties with default values
                  color: { name: '', url: '' },
                  egg_groups: [],
                  evolution_chain: { name: '', url: '' },
                  evolves_from_species: null,
                  form_descriptions: [],
                  forms_switchable: false,
                  gender_rate: -1,
                  genera: [],
                  generation: { name: '', url: '' },
                  growth_rate: { name: '', url: '' },
                  habitat: null,
                  has_gender_differences: false,
                  hatch_counter: 0,
                  names: [],
                  order: pokemonData.id,
                  pal_park_encounters: [],
                  pokedex_numbers: [],
                  shape: { name: '', url: '' },
                  varieties: []
                }
              } as unknown as Pokemon;
            })
          );
    } else {
      return this.restService.getAllData(pokemonName);
    }
  }

  getSpeciesData(speciesUrl: string): Observable<PokemonSpecies> {
    const apiType = this.apiType();
    if (apiType === 'graphql') {
      // Extract species ID from URL
      const speciesId = parseInt(speciesUrl.split('/').slice(-2)[0]);
      return this.graphqlService.getSpeciesData(speciesId).pipe(
        map((response: GraphQLResponse<{ pokemonspecies: PokemonSpecies[] }>) => {
          const speciesData = response.data.pokemonspecies[0];
          if (!speciesData) {
            throw new Error(`Species with ID ${speciesId} not found`);
          }
          return speciesData;
        })
      );
    } else {
      return this.restService.getSpeciesData(speciesUrl);
    }
  }

  private transformGraphQLPokemon(pokemonData: any): Pokemon {
    // Transform GraphQL response to match REST Pokemon interface
    const sprites = pokemonData.pokemonsprites[0]?.sprites || {};
    
    return {
      id: pokemonData.id,
      name: pokemonData.name,
      height: pokemonData.height,
      weight: pokemonData.weight,
      base_experience: pokemonData.base_experience,
      sprites: sprites,
      abilities: pokemonData.pokemonabilities.map((ability: any) => ({
        ability: {
          name: ability.ability.name,
          url: `https://pokeapi.co/api/v2/ability/${ability.ability.name}/`
        },
        is_hidden: ability.is_hidden,
        slot: ability.slot
      })),
      stats: pokemonData.pokemonstats.map((stat: any) => ({
        base_stat: stat.base_stat,
        effort: stat.effort,
        stat: {
          name: stat.stat.name,
          url: `https://pokeapi.co/api/v2/stat/${stat.stat.name}/`
        }
      })),
      types: pokemonData.pokemontypes.map((type: any) => ({
        slot: type.slot,
        type: {
          name: type.type.name,
          url: `https://pokeapi.co/api/v2/type/${type.type.name}/`
        }
      })),
      moves: pokemonData.pokemonmoves.map((move: any) => ({
        move: {
          name: move.move.name,
          url: `https://pokeapi.co/api/v2/move/${move.move.name}/`
        },
        version_group_details: []
      })),
      species: {
        name: pokemonData.pokemonspecy.name,
        url: `https://pokeapi.co/api/v2/pokemon-species/${pokemonData.pokemonspecy.id}/`
      },
      // Add other required properties with default values
      cries: { latest: '', legacy: '' },
      forms: [],
      game_indices: [],
      held_items: [],
      is_default: true,
      location_area_encounters: '',
      order: pokemonData.id,
      past_abilities: [],
      past_types: [],
      species_details: {
        id: pokemonData.pokemonspecy.id,
        name: pokemonData.pokemonspecy.name,
        base_happiness: pokemonData.pokemonspecy.base_happiness,
        capture_rate: pokemonData.pokemonspecy.capture_rate,
        is_baby: pokemonData.pokemonspecy.is_baby,
        is_legendary: pokemonData.pokemonspecy.is_legendary,
        is_mythical: pokemonData.pokemonspecy.is_mythical,
        flavor_text_entries: pokemonData.pokemonspecy.pokemonspeciesflavortexts.map((entry: any) => ({
          flavor_text: entry.flavor_text,
          language: { name: entry.language.name, url: '' },
          version: { name: '', url: '' }
        })),
        // Add other required properties with default values
        color: { name: '', url: '' },
        egg_groups: [],
        evolution_chain: { name: '', url: '' },
        evolves_from_species: null,
        form_descriptions: [],
        forms_switchable: false,
        gender_rate: -1,
        genera: [],
        generation: { name: '', url: '' },
        growth_rate: { name: '', url: '' },
        habitat: null,
        has_gender_differences: false,
        hatch_counter: 0,
        names: [],
        order: pokemonData.id,
        pal_park_encounters: [],
        pokedex_numbers: [],
        shape: { name: '', url: '' },
        varieties: []
      }
                     } as unknown as Pokemon;
  }
} 