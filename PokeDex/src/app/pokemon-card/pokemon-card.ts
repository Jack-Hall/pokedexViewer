import { Component, input } from '@angular/core';
import { Pokemon } from '../pokemon.types';
@Component({
  selector: 'app-pokemon-card',
  imports: [],
  templateUrl: './pokemon-card.html',
  styleUrl: './pokemon-card.css'
})
export class PokemonCard {
  pokemon = input<Pokemon>();
}
