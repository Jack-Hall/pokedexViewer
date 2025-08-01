import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Pokemon } from './pokemon.types';

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
    return this.http.get<any>('https://pokeapi.co/api/v2/pokemon?limit=10')

  }

  getAllData(pokemon_name: string){
    return this.http.get<Pokemon>('https://pokeapi.co/api/v2/pokemon/'+pokemon_name)
  }
  
//   // Signals to store the data and loading state
//   private readonly _data = signal<PokemonData[]>([]);
//   private readonly _loading = signal(false);
//   private readonly _error = signal<string | null>(null);
//   private readonly _initialized = signal(false);

//   // Public readonly signals
//   readonly data: any = this._data.asReadonly();
//   readonly loading = this._loading.asReadonly();
//   readonly error = this._error.asReadonly();
//   readonly initialized = this._initialized.asReadonly();

//   /**
//    * Initialize the data by making the API call
//    * This method should only be called once when the app loads
//    */
//   initializeData(): Observable<PokemonData[]> {
//     // Prevent multiple calls
//     if (this._initialized()) {
//       return new Observable(subscriber => {
//         subscriber.next(this._data());
//         subscriber.complete();
//       });
//     }

//     this._loading.set(true);
//     this._error.set(null);

//     // Replace with your actual API endpoint
//     return this.http.get<any>('https://pokeapi.co/api/v2/pokemon?limit=151')
//       .pipe(
//         tap({
//           next: (data) => {
//             this._data.set(data.results);
//             this._loading.set(false);
//             this._initialized.set(true);
//           },
//           error: (error) => {
//             this._error.set(error.message || 'Failed to load data');
//             this._loading.set(false);
//           }
//         })
//       );
//   }

//   /**
//    * Get the current data
//    */
//   getData(): PokemonData[] {
//     return this._data();
//   }


//   /**
//    * Check if data has been initialized
//    */
//   isInitialized(): boolean {
//     return this._initialized();
//   }
} 