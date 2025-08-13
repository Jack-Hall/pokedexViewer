import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Pokemon, PokemonSpecies } from './pokemon.types';

export interface GraphQLResponse<T> {
  data: T;
  errors?: any[];
}

export interface PokemonListResponse {
  pokemon: Array<{
    id: number;
    name: string;
    height: number;
    weight: number;
    base_experience: number;
    pokemonsprites: Array<{
      sprites: string;
    }>;
    pokemonabilities: Array<{
      is_hidden: boolean;
      slot: number;
      ability: {
        name: string;
      };
    }>;
    pokemonstats: Array<{
      base_stat: number;
      effort: number;
      stat: {
        name: string;
      };
    }>;
    pokemontypes: Array<{
      slot: number;
      type: {
        name: string;
      };
    }>;
    pokemonmoves: Array<{
      move: {
        name: string;
      };
    }>;
    pokemonspecy: {
      id: number;
      name: string;
      base_happiness: number;
      capture_rate: number;
      is_baby: boolean;
      is_legendary: boolean;
      is_mythical: boolean;
      pokemonspeciesflavortexts: Array<{
        flavor_text: string;
        language: {
          name: string;
        };
      }>;
    };
  }>;
}

export interface PokemonDetailResponse {
  pokemon: Array<{
    id: number;
    name: string;
    height: number;
    weight: number;
    base_experience: number;
    pokemonsprites: Array<{
      sprites: string;
    }>;
    pokemonabilities: Array<{
      is_hidden: boolean;
      slot: number;
      ability: {
        name: string;
      };
    }>;
    pokemonstats: Array<{
      base_stat: number;
      effort: number;
      stat: {
        name: string;
      };
    }>;
    pokemontypes: Array<{
      slot: number;
      type: {
        name: string;
      };
    }>;
    pokemonmoves: Array<{
      move: {
        name: string;
      };
    }>;
    pokemonspecy: {
      id: number;
      name: string;
      base_happiness: number;
      capture_rate: number;
      is_baby: boolean;
      is_legendary: boolean;
      is_mythical: boolean;
      pokemonspeciesflavortexts: Array<{
        flavor_text: string;
        language: {
          name: string;
        };
      }>;
    };
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class GraphQLDataService {
  private readonly http = inject(HttpClient);
  private readonly graphqlUrl = 'https://graphql.pokeapi.co/v1beta2';

  getPokemonList(limit: number = 500, offset: number = 0): Observable<GraphQLResponse<PokemonListResponse>> {
    const query = `
      query GetPokemonList($limit: Int!, $offset: Int!) {
        pokemon(limit: $limit, offset: $offset) {
          id
          name
          height
          weight
          base_experience
          pokemonsprites {
            sprites
          }
          pokemonabilities {
            is_hidden
            slot
            ability {
              name
            }
          }
          pokemonstats {
            base_stat
            effort
            stat {
              name
            }
          }
          pokemontypes {
            slot
            type {
              name
            }
          }
          pokemonmoves {
            move {
              name
            }
          }
          pokemonspecy {
            id
            name
            base_happiness
            capture_rate
            is_baby
            is_legendary
            is_mythical
            pokemonspeciesflavortexts(where: {language: {name: {_eq: "en"}}}, limit: 1) {
              flavor_text
              language {
                name
              }
            }
          }
        }
      }
    `;

    return this.http.post<GraphQLResponse<PokemonListResponse>>(this.graphqlUrl, {
      query,
      variables: { limit, offset }
    }).pipe(
      map(response => {
        if (response.errors && response.errors.length > 0) {
          throw new Error(`GraphQL errors: ${response.errors.map(e => e.message).join(', ')}`);
        }
        return response;
      })
    );
  }

  getPokemonDetail(nameOrId: string | number): Observable<GraphQLResponse<PokemonDetailResponse>> {
    const query = `
      query GetPokemonDetail($name: String!) {
        pokemon(where: {name: {_eq: $name}}) {
          id
          name
          height
          weight
          base_experience
          pokemonsprites {
            sprites
          }
          pokemonabilities {
            is_hidden
            slot
            ability {
              name
            }
          }
          pokemonstats {
            base_stat
            effort
            stat {
              name
            }
          }
          pokemontypes {
            slot
            type {
              name
            }
          }
          pokemonmoves {
            move {
              name
            }
          }
          pokemonspecies {
            id
            name
            base_happiness
            capture_rate
            is_baby
            is_legendary
            is_mythical
            pokemonspeciesflavortexts(where: {language: {name: {_eq: "en"}}}, limit: 1) {
              flavor_text
              language {
                name
              }
            }
          }
        }
      }
    `;

    return this.http.post<GraphQLResponse<PokemonDetailResponse>>(this.graphqlUrl, {
      query,
      variables: { name: nameOrId.toString().toLowerCase() }
    }).pipe(
      map(response => {
        if (response.errors && response.errors.length > 0) {
          throw new Error(`GraphQL errors: ${response.errors.map(e => e.message).join(', ')}`);
        }
        return response;
      })
    );
  }

  getSpeciesData(speciesId: number): Observable<GraphQLResponse<{ pokemonspecies: PokemonSpecies[] }>> {
    const query = `
      query GetSpeciesData($id: Int!) {
        pokemonspecies(where: {id: {_eq: $id}}) {
          id
          name
          base_happiness
          capture_rate
          is_baby
          is_legendary
          is_mythical
          pokemonspeciesflavortexts(where: {language: {name: {_eq: "en"}}}) {
            flavor_text
            language {
              name
            }
          }
        }
      }
    `;

    return this.http.post<GraphQLResponse<{ pokemonspecies: PokemonSpecies[] }>>(this.graphqlUrl, {
      query,
      variables: { id: speciesId }
    }).pipe(
      map(response => {
        if (response.errors && response.errors.length > 0) {
          throw new Error(`GraphQL errors: ${response.errors.map(e => e.message).join(', ')}`);
        }
        return response;
      })
    );
  }
} 