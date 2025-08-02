import { Component,  OnInit } from '@angular/core';
import { PokemonDataService, PokemonData } from '../data.service';
import { PokemonCard } from '../pokemon-card/pokemon-card';
import { Pokemon } from '../pokemon.types';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-pokemon-list-item',
  imports: [PokemonCard],
  templateUrl: './pokemon-list-item.html',
  styleUrl: './pokemon-list-item.css'
})

export class PokemonList  implements OnInit {
  pokemons: Pokemon[] = []
  selectedPokemon: Pokemon | null = null;

  constructor(
    private dataService: PokemonDataService
  )
  {

  }

  ngOnInit(): void {
    this.dataService.getPokemon()
    .subscribe((response: any)=> {
      console.log(response);
      
      // Create an array of observables for all Pokemon data calls
      const pokemonObservables = response.results.map((pokemon: any) => 
        this.dataService.getAllData(pokemon.name)
      );
      
      // Wait for all calls to complete, then sort
      forkJoin(pokemonObservables).subscribe((pokemonData: unknown) => {
        this.pokemons = (pokemonData as Pokemon[]).sort((poke_a: Pokemon, poke_b: Pokemon) => {
          return poke_a.id - poke_b.id; // Sort by ID ascending
        });
        console.log('Sorted Pokemon:', this.pokemons);
      });
    });
  }

  onPokemonHover(pokemon: Pokemon): void {
    this.selectedPokemon = pokemon;
  }

  onPokemonLeave(): void {
    this.selectedPokemon = null;
  }
}
