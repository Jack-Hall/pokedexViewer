import { Routes } from '@angular/router';
import { TeamBuilderComponent } from './team-builder/team-builder.component';
import { PokemonList } from './pokemon-list-item/pokemon-list-item';

export const routes: Routes = [
  {
    path: '',
    component: TeamBuilderComponent
  },
  {
    path: 'team-builder',
    component: TeamBuilderComponent
  },
  {
    path: 'pokemon-list',
    component: PokemonList
  }
];
