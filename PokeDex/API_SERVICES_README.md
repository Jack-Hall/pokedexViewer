# Pokemon API Services

This project now supports both REST and GraphQL APIs for fetching Pokemon data, with the ability to switch between them dynamically.

## Services Overview

### 1. PokemonDataService (REST)
- **File**: `src/app/data.service.ts`
- **API**: https://pokeapi.co/api/v2/
- **Methods**:
  - `getPokemon()` - Get list of Pokemon
  - `getAllData(pokemonName)` - Get detailed Pokemon data
  - `getSpeciesData(speciesUrl)` - Get species information

### 2. GraphQLDataService (GraphQL)
- **File**: `src/app/graphql-data.service.ts`
- **API**: https://graphql.pokeapi.co/v1beta2
- **Methods**:
  - `getPokemonList(limit, offset)` - Get list of Pokemon
  - `getPokemonDetail(nameOrId)` - Get detailed Pokemon data
  - `getSpeciesData(speciesId)` - Get species information

### 3. UnifiedDataService (Main Service)
- **File**: `src/app/unified-data.service.ts`
- **Purpose**: Provides a unified interface that can switch between REST and GraphQL APIs
- **Features**:
  - Dynamic API switching using Angular signals
  - Automatic response transformation to maintain compatibility
  - Same method signatures as the original REST service

## Usage

### Basic Usage

```typescript
import { UnifiedDataService } from './unified-data.service';

export class MyComponent {
  constructor(private dataService: UnifiedDataService) {}

  // Get Pokemon list (uses current API setting)
  getPokemon() {
    this.dataService.getPokemon().subscribe(data => {
      console.log(data);
    });
  }

  // Get detailed Pokemon data
  getPokemonDetails(name: string) {
    this.dataService.getAllData(name).subscribe(pokemon => {
      console.log(pokemon);
    });
  }
}
```

### Switching APIs

```typescript
// Switch to GraphQL API
this.dataService.setApiType('graphql');

// Switch to REST API
this.dataService.setApiType('rest');

// Toggle between APIs
this.dataService.toggleApiType();

// Get current API type
const currentApi = this.dataService.currentApiType();
```

### API Switcher Component

Use the `ApiSwitcherComponent` to provide a UI for switching between APIs:

```typescript
import { ApiSwitcherComponent } from './api-switcher/api-switcher';

// In your component template
<app-api-switcher></app-api-switcher>
```

## API Differences

### REST API (Default)
- Uses traditional REST endpoints
- Multiple HTTP requests for complex data
- Simpler to understand and debug

### GraphQL API
- Single endpoint for all queries
- More efficient data fetching
- Better for complex queries
- Requires understanding of GraphQL schema

## Configuration

The default API type is set to 'rest'. You can change this by:

1. **Programmatically**: Use `setApiType()` method
2. **UI**: Use the `ApiSwitcherComponent`
3. **Default**: Modify the `apiType` signal in `UnifiedDataService`

## Error Handling

Both services include error handling for:
- Network errors
- Invalid Pokemon names/IDs
- API rate limiting
- Malformed responses

## Performance Considerations

- **REST API**: Good for simple queries, multiple requests for complex data
- **GraphQL API**: Better for complex queries, single request for multiple data points
- **Caching**: Consider implementing caching for frequently accessed data
- **Rate Limiting**: Both APIs have rate limits, implement appropriate delays if needed

## Migration Guide

If you're currently using `PokemonDataService` directly:

1. Replace imports:
   ```typescript
   // Old
   import { PokemonDataService } from './data.service';
   
   // New
   import { UnifiedDataService } from './unified-data.service';
   ```

2. Update constructor:
   ```typescript
   // Old
   constructor(private dataService: PokemonDataService) {}
   
   // New
   constructor(private dataService: UnifiedDataService) {}
   ```

3. Method calls remain the same - no code changes needed!

## Testing

Both APIs can be tested independently:

```typescript
// Test REST API
this.dataService.setApiType('rest');
this.dataService.getPokemon().subscribe(console.log);

// Test GraphQL API
this.dataService.setApiType('graphql');
this.dataService.getPokemon().subscribe(console.log);
``` 