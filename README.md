# Snake Game

A modern implementation of the classic Snake game with smooth animations, sound effects, and responsive design.

## Features

- Smooth snake movement with direction-based animations
- Pulsing food with glow effects
- Sound effects for eating and game over
- Responsive design
- Score tracking
- Game over handling with restart option

## Deployment Options

### 1. GitHub Pages (Free)

1. Create a new GitHub repository
2. Push your code to the repository
3. Go to repository Settings > Pages
4. Select 'main' branch as source
5. Your game will be available at `https://[your-username].github.io/[repository-name]`

### 2. Netlify (Free)

1. Create a Netlify account
2. Connect your GitHub repository
3. Deploy with default settings
4. Your game will be available at `https://[your-site-name].netlify.app`

### 3. Vercel (Free)

1. Create a Vercel account
2. Connect your GitHub repository
3. Deploy with default settings
4. Your game will be available at `https://[your-site-name].vercel.app`

### 4. Local Deployment

1. Clone this repository
2. Open `index.html` in a web browser
3. Or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve
   ```

## File Structure

```
snake-game/
├── index.html      # Main HTML file
├── snake.js        # Game logic
├── eat.mp3         # Eating sound effect
├── gameover.mp3    # Game over sound effect
└── README.md       # This file
```

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Development

To modify the game:
1. Edit `snake.js` for game logic
2. Edit `index.html` for layout and styling
3. Replace sound files to change sound effects

## License

MIT License - Feel free to use this code for your own projects! 