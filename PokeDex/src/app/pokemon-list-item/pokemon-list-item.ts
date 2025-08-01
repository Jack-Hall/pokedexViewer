import { Component,  OnInit } from '@angular/core';
import { PokemonDataService, PokemonData } from '../data.service';
import { PokemonCard } from '../pokemon-card/pokemon-card';
import { Pokemon } from '../pokemon.types';

@Component({
  selector: 'app-pokemon-list-item',
  imports: [PokemonCard],
  templateUrl: './pokemon-list-item.html',
  styleUrl: './pokemon-list-item.css'
})

export class PokemonList  implements OnInit {
  pokemons: Pokemon[] = []
  constructor(
    private dataService: PokemonDataService
  )
  {

  }
  ngOnInit(): void {
    this.dataService.getPokemon()
    .subscribe((response: any)=> {
      console.log(response);
      for(let i = 0; i < response.results.length; ++i){
        this.dataService.getAllData(response.results[i].name).subscribe((response: any) => this.pokemons.push(response));
      }
      console.log(this.pokemons)
      }
  )
    
  }
}
