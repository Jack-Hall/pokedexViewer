import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PokemonDataService } from './data.service';
import { PokemonList } from './pokemon-list-item/pokemon-list-item';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PokemonList],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App   {
  


}
