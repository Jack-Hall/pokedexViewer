import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../pokemon.types';
import { TypeCard } from '../type-card/type-card';

@Component({
  selector: 'app-pokemon-card',
  imports: [TypeCard, CommonModule],
  templateUrl: './pokemon-card.html',
  styleUrl: './pokemon-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PokemonCard {
  pokemon = input<Pokemon>();
  isShiny = input<boolean>(false);

  private readonly softTypeColorMap: Record<string, string> = {
    'normal': '#F5F5DC',
    'fire': '#FFE4E1',
    'water': '#E6F3FF',
    'grass': '#E8F5E8',
    'flying': '#F0F8FF',
    'fighting': '#FFE6E6',
    'poison': '#F8E6FF',
    'electric': '#FFF8DC',
    'ground': '#F5F5DC',
    'rock': '#F5F5F0',
    'psychic': '#FFE6F2',
    'ice': '#F0F8FF',
    'bug': '#F0FFF0',
    'ghost': '#F8F0FF',
    'dragon': '#E6E6FA',
    'dark': '#F5F5F5',
    'steel': '#F0F0F0',
    'fairy': '#FFE6F5'
  };

  getBackgroundStyle(): string {
    const types = this.pokemon()?.types || [];
    
    if (types.length === 0) {
      return 'background: white;';
    }
    
    if (types.length === 1) {
      const color = this.softTypeColorMap[types[0].type.name] || '#F5F5DC';
      return `background: ${color};`;
    }
    
    if (types.length === 2) {
      const color1 = this.softTypeColorMap[types[0].type.name] || '#F5F5DC';
      const color2 = this.softTypeColorMap[types[1].type.name] || '#F5F5DC';
      return `background: linear-gradient(135deg, ${color1} 0%, ${color2} 100%);`;
    }
    
    return 'background: white;';
  }

  getSpriteUrl(): string {
    const pokemon = this.pokemon();
    if (!pokemon) return '';
    
    if (this.isShiny() && pokemon.sprites.front_shiny) {
      return pokemon.sprites.front_shiny;
    }
    
    return pokemon.sprites.front_default || '';
  }
}
