import { Component, input } from '@angular/core';
import { Pokemon } from '../pokemon.types';
import { TypeCard } from '../type-card/type-card';
@Component({
  selector: 'app-pokemon-card',
  imports: [TypeCard],
  templateUrl: './pokemon-card.html',
  styleUrl: './pokemon-card.css'
})
export class PokemonCard {
  pokemon = input<Pokemon>();
}
