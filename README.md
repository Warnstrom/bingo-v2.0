# Bingo Game

A dynamic Bingo game built with vanilla Javascript. This application provides an interactive Bingo board where users can toggle squares to match phrases and emojis, aiming to achieve Bingo patterns. The game tracks the state of the board, identifies winning patterns, and saves user progress.

## Features

- **Random Phrases and Emojis:** Each square displays a random phrase or emoji when toggled, adding variety to the game.
- **Winning Patterns:** The game supports multiple winning patterns, including rows, columns, and diagonals.
- **Local Storage:** Progress is saved automatically in the browser’s local storage, allowing users to return to their game anytime.
- **Customizable Themes:** Themes change the emoji selection, and users can switch between Christmas and Halloween modes.
- **Responsive Design:** The board adjusts to fit a range of screen sizes, making it accessible on various devices.

## How It Works

### Core Logic

1. **Grid Representation:**  
   The board is a 5x5 grid represented by a `Uint32Array` bitset. Each square in the grid has a corresponding bit that tracks whether it is active (toggled) or inactive.

2. **Bit Manipulation for Grid State:**
   - A `bitSet` array represents the state of each tile (active/inactive) and is updated with bitwise operations:
     - `set` method activates a tile.
     - `clear` method deactivates a tile.
     - `isSet` checks if a tile is active.

3. **Phrase and Emoji Storage:**  
   - The game uses a list of phrases and a set of emojis to display different content when tiles are toggled. The `getRandomContent` and `getRandomPhrase` functions randomly select these items.
   - `CONTENT` and `phrases` arrays are customizable lists, allowing easy theme and phrase updates.

4. **Local Storage for Game State:**  
   - Local storage is used to save the current board state (`bitSet`) and the selected phrases for each tile.
   - This allows players to return to the game without losing their progress.

5. **Winning Masks and Patterns:**  
   - Predefined winning masks correspond to possible Bingo lines (rows, columns, and diagonals).
   - The `hasBingo` function checks if the active squares match any winning mask, and if so, triggers a win sequence with a message.

## Getting Started

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/bingo-game.git
   cd bingo-game
