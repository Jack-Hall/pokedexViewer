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

  getFirstFlavorText(): string | null {
    if (!this.pokemon?.species_details?.flavor_text_entries) {
      return null;
    }

    // Find the first English flavor text entry
    const englishEntry = this.pokemon.species_details.flavor_text_entries.find(
      entry => entry.language.name === 'en'
    );

    if (englishEntry) {
      // Clean up the flavor text by removing \f and \n characters
      return englishEntry.flavor_text
        .replace(/\f/g, ' ') // Replace form feed with space
        .replace(/\n/g, ' ') // Replace newlines with space
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();
    }

    return null;
  }
} 