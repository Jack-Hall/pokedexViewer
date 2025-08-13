import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PokemonDataService } from './data.service';
import { PokemonList } from './pokemon-list-item/pokemon-list-item';
import { ChatWindow } from './chat-window/chat-window';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PokemonList, ChatWindow],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Navigation logic can be added here if needed
}
