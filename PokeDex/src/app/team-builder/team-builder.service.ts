import { Injectable, inject, signal } from '@angular/core';
import { Pokemon } from '../pokemon.types';

export interface TeamPokemon {
  id: number;
  name: string;
  pokemon: Pokemon;
  selectedMoves: string[];
  maxMoves: number;
}

export interface PokemonTeam {
  id: string;
  name: string;
  pokemon: TeamPokemon[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TeamBuilderService {
  private readonly _currentTeam = signal<PokemonTeam>({
    id: this.generateTeamId(),
    name: 'New Team',
    pokemon: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });

  private readonly _availableMoves = signal<Map<number, string[]>>(new Map());

  // Expose signals as readonly
  readonly currentTeam = this._currentTeam.asReadonly();
  readonly availableMoves = this._availableMoves.asReadonly();

  private generateTeamId(): string {
    return 'team_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  addPokemonToTeam(pokemon: Pokemon): void {
    const currentTeam = this._currentTeam();
    
    // Check if team is full (max 6 Pokemon)
    if (currentTeam.pokemon.length >= 6) {
      console.warn('Team is already full (6 Pokemon maximum)');
      return;
    }

    // Check if Pokemon is already in team
    if (currentTeam.pokemon.some(tp => tp.id === pokemon.id)) {
      console.warn('Pokemon is already in the team');
      return;
    }

    // Get available moves for this Pokemon
    const moves = pokemon.moves?.map(move => move.move.name) || [];
    this._availableMoves.update(movesMap => {
      const newMap = new Map(movesMap);
      newMap.set(pokemon.id, moves);
      return newMap;
    });

    const teamPokemon: TeamPokemon = {
      id: pokemon.id,
      name: pokemon.name,
      pokemon: pokemon,
      selectedMoves: [],
      maxMoves: 4
    };

    this._currentTeam.update(team => ({
      ...team,
      pokemon: [...team.pokemon, teamPokemon],
      updatedAt: new Date()
    }));
  }

  removePokemonFromTeam(pokemonId: number): void {
    this._currentTeam.update(team => ({
      ...team,
      pokemon: team.pokemon.filter(tp => tp.id !== pokemonId),
      updatedAt: new Date()
    }));

    // Remove moves from available moves map
    this._availableMoves.update(movesMap => {
      const newMap = new Map(movesMap);
      newMap.delete(pokemonId);
      return newMap;
    });
  }

  selectMove(pokemonId: number, moveName: string): void {
    this._currentTeam.update(team => ({
      ...team,
      pokemon: team.pokemon.map(tp => {
        if (tp.id === pokemonId) {
          // Check if move is already selected
          if (tp.selectedMoves.includes(moveName)) {
            return tp;
          }
          
          // Check if max moves reached
          if (tp.selectedMoves.length >= tp.maxMoves) {
            console.warn('Maximum moves reached for this Pokemon');
            return tp;
          }

          return {
            ...tp,
            selectedMoves: [...tp.selectedMoves, moveName]
          };
        }
        return tp;
      }),
      updatedAt: new Date()
    }));
  }

  removeMove(pokemonId: number, moveName: string): void {
    this._currentTeam.update(team => ({
      ...team,
      pokemon: team.pokemon.map(tp => {
        if (tp.id === pokemonId) {
          return {
            ...tp,
            selectedMoves: tp.selectedMoves.filter(move => move !== moveName)
          };
        }
        return tp;
      }),
      updatedAt: new Date()
    }));
  }

  updateTeamName(name: string): void {
    this._currentTeam.update(team => ({
      ...team,
      name,
      updatedAt: new Date()
    }));
  }

  clearTeam(): void {
    this._currentTeam.set({
      id: this.generateTeamId(),
      name: 'New Team',
      pokemon: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    this._availableMoves.set(new Map());
  }

  getAvailableMovesForPokemon(pokemonId: number): string[] {
    return this._availableMoves().get(pokemonId) || [];
  }

  getSelectedMovesForPokemon(pokemonId: number): string[] {
    const teamPokemon = this._currentTeam().pokemon.find(tp => tp.id === pokemonId);
    return teamPokemon?.selectedMoves || [];
  }

  isTeamFull(): boolean {
    return this._currentTeam().pokemon.length >= 6;
  }

  getTeamStats(): { totalPokemon: number; totalMoves: number; completionPercentage: number } {
    const team = this._currentTeam();
    const totalPokemon = team.pokemon.length;
    const totalMoves = team.pokemon.reduce((sum, tp) => sum + tp.selectedMoves.length, 0);
    const maxPossibleMoves = totalPokemon * 4;
    const completionPercentage = maxPossibleMoves > 0 ? (totalMoves / maxPossibleMoves) * 100 : 0;

    return {
      totalPokemon,
      totalMoves,
      completionPercentage: Math.round(completionPercentage)
    };
  }
} 