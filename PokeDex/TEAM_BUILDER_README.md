# Pokemon Team Builder

A comprehensive Pokemon team building feature that allows users to create teams of 6 Pokemon with selected moves.

## Features

### Team Management
- **Team Composition**: Build teams with up to 6 Pokemon
- **Team Naming**: Customize team names
- **Team Statistics**: View team completion percentage and move count
- **Clear Team**: Reset team to start fresh

### Pokemon Selection
- **Search Functionality**: Search Pokemon by name or ID
- **Type Display**: See Pokemon types with color-coded badges
- **Add/Remove**: Easily add Pokemon to team or remove them
- **Team Validation**: Prevents duplicate Pokemon and enforces 6-Pokemon limit

### Move Selection
- **Available Moves**: View all moves available to each Pokemon
- **Move Selection**: Select up to 4 moves per Pokemon
- **Move Management**: Add and remove moves with visual feedback
- **Move Counter**: Track selected moves vs. maximum allowed

### User Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Visual Feedback**: Clear indication of selected Pokemon and moves
- **Type Colors**: Color-coded type badges for easy identification
- **Modern UI**: Beautiful gradient backgrounds and smooth animations

## How to Use

### Adding Pokemon to Your Team
1. Navigate to the Team Builder page
2. Use the search bar to find specific Pokemon
3. Click "Add" next to a Pokemon to add it to your team
4. Pokemon already in your team will show "Remove" instead

### Selecting Moves
1. Once a Pokemon is added to your team, it appears in the team composition area
2. Click on available moves to add them to the Pokemon
3. Each Pokemon can have up to 4 moves
4. Click the "×" button next to a move to remove it

### Managing Your Team
- **Team Name**: Click on the team name to edit it
- **Team Stats**: View your team's completion status
- **Clear Team**: Use the "Clear Team" button to start over
- **Remove Pokemon**: Click the "×" button on a Pokemon card to remove it

## Technical Implementation

### Components
- **TeamBuilderComponent**: Main team builder interface
- **TeamBuilderService**: Manages team state and operations
- **NavigationComponent**: App navigation between features

### Services
- **TeamBuilderService**: Handles team data management
  - Team composition tracking
  - Move selection logic
  - Team validation
  - Statistics calculation

### Data Flow
1. Pokemon data is loaded from the UnifiedDataService (supports both REST and GraphQL APIs)
2. Team state is managed through Angular signals for reactive updates
3. Move availability is determined from Pokemon's move list
4. Team statistics are computed in real-time

### State Management
- Uses Angular signals for reactive state management
- Team data persists during the session
- Real-time updates when Pokemon or moves are added/removed

## API Integration

The Team Builder integrates with the existing Pokemon API infrastructure:
- **UnifiedDataService**: Uses the same API switching mechanism
- **GraphQL Support**: Leverages comprehensive Pokemon data from GraphQL
- **REST Fallback**: Works with REST API when GraphQL is unavailable

## Future Enhancements

Potential improvements for the Team Builder:
- **Team Export**: Save teams to local storage or export as JSON
- **Team Import**: Load previously saved teams
- **Move Details**: Show move power, accuracy, and type
- **Team Analysis**: Provide team composition suggestions
- **Type Coverage**: Analyze team's type coverage and weaknesses
- **Competitive Stats**: Show base stats and competitive viability

## Navigation

The Team Builder is accessible through:
- **Default Route**: `/` (Team Builder is the main page)
- **Direct Route**: `/team-builder`
- **Navigation**: Use the navigation bar to switch between Team Builder and Pokemon List

## Dependencies

- Angular 17+ with standalone components
- Angular signals for state management
- Angular Router for navigation
- Existing Pokemon API services
- TypeScript for type safety 