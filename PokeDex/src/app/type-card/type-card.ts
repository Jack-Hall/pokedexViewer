import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type PokemonType = 
  | 'normal' | 'fire' | 'water' | 'grass' | 'flying' | 'fighting' 
  | 'poison' | 'electric' | 'ground' | 'rock' | 'psychic' | 'ice' 
  | 'bug' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

@Component({
  selector: 'app-type-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './type-card.html',
  styleUrl: './type-card.css'
})
export class TypeCard {
  @Input() type!: PokemonType;

  private readonly typeColorMap: Record<PokemonType, string> = {
    'normal': '#A8A878',
    'fire': '#F08030',
    'water': '#6890F0',
    'grass': '#78C850',
    'flying': '#A890F0',
    'fighting': '#C03028',
    'poison': '#A040A0',
    'electric': '#F8D030',
    'ground': '#E0C068',
    'rock': '#B8A038',
    'psychic': '#F85888',
    'ice': '#98D8D8',
    'bug': '#A8B820',
    'ghost': '#705898',
    'dragon': '#7038F8',
    'dark': '#705848',
    'steel': '#B8B8D0',
    'fairy': '#EE99AC'
  };

  getTypeColor(): string {
    return this.typeColorMap[this.type] || '#A8A878';
  }

  getTypeName(): string {
    return this.type.charAt(0).toUpperCase() + this.type.slice(1);
  }
}
