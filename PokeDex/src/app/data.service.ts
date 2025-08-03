import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Pokemon, PokemonSpecies } from './pokemon.types';

export interface PokemonData {
  id: number;
  name: string;
  // Add more properties as needed based on your API response
}

@Injectable({
  providedIn: 'root'
})
export class PokemonDataService {

  private readonly http = inject(HttpClient);

  //Get pokemon
  getPokemon(){
    return this.http.get<any>('https://pokeapi.co/api/v2/pokemon?limit=500&offset=0')

  }

  getAllData(pokemon_name: string){
    return this.http.get<Pokemon>('https://pokeapi.co/api/v2/pokemon/'+pokemon_name)
  }
  getSpeciesData(species_url: string){
    return  this.http.get<PokemonSpecies>(species_url)
  }

} 