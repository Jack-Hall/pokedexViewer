import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypeCard } from '../type-card/type-card';
import { Pokemon } from '../pokemon.types';

@Component({
  selector: 'app-pokemon-detail-panel',
  standalone: true,
  imports: [TypeCard, CommonModule],
  templateUrl: './pokemon-detail-panel.html',
  styleUrl: './pokemon-detail-panel.css'
})
export class PokemonDetailPanel {
  @Input() pokemon: Pokemon | null = null;
  @Input() isShiny: boolean = false;

  getSpriteUrl(): string {
    if (!this.pokemon) return '';
    
    if (this.isShiny && this.pokemon.sprites.front_shiny) {
      return this.pokemon.sprites.front_shiny;
    }
    
    return this.pokemon.sprites.front_default || '';
  }
} 