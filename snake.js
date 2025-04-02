class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.gameOverElement = document.getElementById('game-over');

        // NEW: Get button elements
        this.btnUp = document.getElementById('btn-up');
        this.btnLeft = document.getElementById('btn-left');
        this.btnDown = document.getElementById('btn-down');
        this.btnRight = document.getElementById('btn-right');

        // Sound setup
        this.setupSounds();

        // Set canvas size
        this.canvas.width = 400;
        this.canvas.height = 400;

        // Game settings
        this.gridSize = 20;
        this.tileCount = 20;
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.direction = {x: 0, y: 0}; // Start stationary
        this.pendingDirection = {x: 0, y: 0}; // Buffer for next direction
        this.score = 0;
        this.gameSpeed = 100; // Milliseconds per update
        this.gameLoop = null;
        this.isGameOver = false;

        // Animation settings
        this.lastTime = 0;
        this.foodAnimationDuration = 1000; // 1 second for full animation cycle

        // Bind event listeners
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        this.bindButtonListeners(); // NEW: Call function to bind button events

        // Start the game and animation
        this.startGame();
        this.animate();
    }

    setupSounds() {
        // Create eating sound with better initialization
        this.eatSound = new Audio();
        this.eatSound.src = 'eat.mp3'; // Make sure you have this file
        this.eatSound.preload = 'auto';
        this.eatSound.volume = 0.4; // Set eating sound to 40% volume

        // Verify eat sound loading
        this.eatSound.addEventListener('canplaythrough', () => { console.log("Eat sound ready."); });
        this.eatSound.addEventListener('error', (e) => { console.error("Error loading eat sound:", e); });

        // Create game over sound with better initialization
        this.gameOverSound = new Audio();
        this.gameOverSound.src = 'gameover.mp3'; // Make sure you have this file
        this.gameOverSound.preload = 'auto';
        this.gameOverSound.volume = 0.5; // Set game over sound to 50% volume

        // Verify sound loading
        this.gameOverSound.addEventListener('canplaythrough', () => { console.log("Game over sound ready."); });
        this.gameOverSound.addEventListener('error', (e) => { console.error("Error loading game over sound:", e); });
    }

    // NEW: Method to bind button listeners
    bindButtonListeners() {
        // Use arrow functions to maintain 'this' context
        const handleUp = (e) => { e.preventDefault(); this.setDirection(0, -1); };
        const handleDown = (e) => { e.preventDefault(); this.setDirection(0, 1); };
        const handleLeft = (e) => { e.preventDefault(); this.setDirection(-1, 0); };
        const handleRight = (e) => { e.preventDefault(); this.setDirection(1, 0); };

        // Add listeners for both click and touchstart
        this.btnUp.addEventListener('click', handleUp);
        this.btnUp.addEventListener('touchstart', handleUp);

        this.btnDown.addEventListener('click', handleDown);
        this.btnDown.addEventListener('touchstart', handleDown);

        this.btnLeft.addEventListener('click', handleLeft);
        this.btnLeft.addEventListener('touchstart', handleLeft);

        this.btnRight.addEventListener('click', handleRight);
        this.btnRight.addEventListener('touchstart', handleRight);
    }


    startGame() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.direction = {x: 0, y: 0}; // Start stationary
        this.pendingDirection = {x: 0, y: 0}; // Reset pending direction
        this.score = 0;
        this.isGameOver = false;
        this.updateScore();
        this.gameOverElement.style.display = 'none';
        // Start the loop slightly delayed to allow first input
        // setTimeout(() => { // Optional delay
             this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
        // }, 10);
    }

    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y)); // Ensure food doesn't spawn on snake

        return food;
    }

    playSound(type = 'eat') {
        let soundToPlay = null;
        if (type === 'gameover') {
            soundToPlay = this.gameOverSound;
        } else { // Default to 'eat'
            soundToPlay = this.eatSound;
        }

        if (soundToPlay && soundToPlay.readyState >= 2) { // HAVE_CURRENT_DATA or more
            soundToPlay.currentTime = 0; // Rewind to start
            soundToPlay.play().catch(error => {
                 // Autoplay restrictions might prevent sound without user interaction
                 // We might need a user interaction (like a click) to enable sounds initially
                console.warn(`Sound play failed for ${type}:`, error);
            });
        } else {
             console.warn(`Sound not ready to play: ${type}`);
             // Optionally try to load again if needed, but preload='auto' should handle it
             // soundToPlay?.load();
        }
    }


    update() {
        if (this.isGameOver) return;

        // Apply the pending direction change if it's valid
        if ( (this.pendingDirection.x !== 0 || this.pendingDirection.y !== 0) && // Is there a pending change?
             !(this.direction.x === -this.pendingDirection.x && this.direction.y === 0 && this.pendingDirection.y === 0) && // Prevent reversing X
             !(this.direction.y === -this.pendingDirection.y && this.direction.x === 0 && this.pendingDirection.x === 0)     // Prevent reversing Y
           ) {
            this.direction = { ...this.pendingDirection };
        }

        // Only move if direction is set (i.e., not {x:0, y:0})
        if (this.direction.x === 0 && this.direction.y === 0) {
            // Don't move if no direction is set (start of game or after restart)
            // Still need to draw, so call draw() and return
            this.draw(); // Keep drawing even when stationary
            return;
        }

        // Calculate new head position based on CURRENT direction
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        // Check for collisions
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }

        // Add new head
        this.snake.unshift(head);

        // Check if snake ate food
        if (head.x === this.food.x && head.y === this.food.y) {
            this.playSound('eat');
            this.score += 10;
            this.updateScore();
            this.food = this.generateFood();
            // Don't pop tail, snake grows
             // Optional: Increase speed slightly?
             // if (this.gameSpeed > 50) { // Set a max speed
             //     this.gameSpeed -= 2;
             //     clearInterval(this.gameLoop);
             //     this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
             // }
        } else {
            // Remove tail segment if no food was eaten
            this.snake.pop();
        }

        // We don't draw in update anymore, rely on animate loop
        // this.draw(); // Remove this - draw happens in animate
    }

    checkCollision(head) {
        // Wall collision
        if (head.x < 0 || head.x >= this.tileCount ||
            head.y < 0 || head.y >= this.tileCount) {
            return true;
        }

        // Self collision (check against segments excluding the very first one which is the current head)
        return this.snake.some((segment, index) => {
            // Don't check collision with the head itself (index 0) if it hasn't moved yet.
            // Only check segments that will become the body.
            return index > 0 && segment.x === head.x && segment.y === head.y;
        });
    }

    animate(currentTime = 0) {
        // Calculate time elapsed since the last frame - useful for frame-rate independent animations
        // const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Only draw if the game is not over
        if (!this.isGameOver) {
            this.draw(currentTime); // Pass timestamp for food animation
        }

        // Request the next frame
        requestAnimationFrame((time) => this.animate(time));
    }


    draw(timestamp = 0) {
        // Clear canvas
        this.ctx.fillStyle = '#34495e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#2ecc71' : '#27ae60'; // Head is brighter green
            this.ctx.beginPath();
            // Draw circle for segment
            this.ctx.arc(
                segment.x * this.gridSize + this.gridSize / 2,
                segment.y * this.gridSize + this.gridSize / 2,
                this.gridSize / 2 - 1, // Slightly smaller radius
                0,
                Math.PI * 2
            );
            this.ctx.fill();

             // Add eyes to the snake head (if snake has moved)
            if (index === 0 && (this.direction.x !== 0 || this.direction.y !== 0)) {
                const eyeSize = 2.5;
                const headX = segment.x * this.gridSize + this.gridSize / 2;
                const headY = segment.y * this.gridSize + this.gridSize / 2;
                const eyeOffsetX = this.gridSize * 0.25 * this.direction.x;
                const eyeOffsetY = this.gridSize * 0.25 * this.direction.y;
                const perpX = -this.direction.y * this.gridSize * 0.20; // Perpendicular direction for eye separation
                const perpY = this.direction.x * this.gridSize * 0.20;

                this.ctx.fillStyle = 'white';
                // Left eye
                this.ctx.beginPath();
                this.ctx.arc(headX + eyeOffsetX + perpX, headY + eyeOffsetY + perpY, eyeSize, 0, Math.PI * 2);
                this.ctx.fill();
                // Right eye
                this.ctx.beginPath();
                this.ctx.arc(headX + eyeOffsetX - perpX, headY + eyeOffsetY - perpY, eyeSize, 0, Math.PI * 2);
                this.ctx.fill();

                // Pupils (optional - add black dots)
                this.ctx.fillStyle = 'black';
                const pupilSize = 1;
                // Left Pupil
                this.ctx.beginPath();
                this.ctx.arc(headX + eyeOffsetX + perpX + (this.direction.x*0.8), headY + eyeOffsetY + perpY + (this.direction.y*0.8), pupilSize, 0, Math.PI * 2);
                this.ctx.fill();
                 // Right Pupil
                this.ctx.beginPath();
                 this.ctx.arc(headX + eyeOffsetX - perpX + (this.direction.x*0.8), headY + eyeOffsetY - perpY + (this.direction.y*0.8), pupilSize, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (index === 0) { // Eyes when stationary (optional, simple centered)
                 const eyeSize = 2;
                 const headX = segment.x * this.gridSize + this.gridSize / 2;
                 const headY = segment.y * this.gridSize + this.gridSize / 2;
                 this.ctx.fillStyle = 'white';
                 this.ctx.beginPath();
                 this.ctx.arc(headX - 4, headY -3, eyeSize, 0, Math.PI * 2);
                 this.ctx.fill();
                 this.ctx.beginPath();
                 this.ctx.arc(headX + 4, headY -3, eyeSize, 0, Math.PI * 2);
                 this.ctx.fill();
                 this.ctx.fillStyle = 'black';
                 this.ctx.beginPath();
                 this.ctx.arc(headX - 4, headY -3, 1, 0, Math.PI * 2);
                 this.ctx.fill();
                 this.ctx.beginPath();
                 this.ctx.arc(headX + 4, headY -3, 1, 0, Math.PI * 2);
                 this.ctx.fill();
            }
        });


        // Draw food with pulsing effect
        const pulseFactor = 0.15; // How much it scales
        const pulseSpeed = 0.004; // How fast it pulses
        const pulseScale = 1 + Math.sin(timestamp * pulseSpeed) * pulseFactor;
        const baseRadius = this.gridSize / 2 - 3; // Slightly smaller base food size
        const pulsedRadius = baseRadius * pulseScale;

        const foodCenterX = this.food.x * this.gridSize + this.gridSize / 2;
        const foodCenterY = this.food.y * this.gridSize + this.gridSize / 2;

        // Optional: Draw outer glow (subtle)
        const glowRadius = pulsedRadius * 1.8;
        const gradient = this.ctx.createRadialGradient(
            foodCenterX, foodCenterY, pulsedRadius * 0.2, // Inner radius
            foodCenterX, foodCenterY, glowRadius        // Outer radius
        );
        gradient.addColorStop(0, 'rgba(231, 76, 60, 0.8)'); // Inner color (red)
        gradient.addColorStop(1, 'rgba(231, 76, 60, 0)'); // Outer color (transparent)

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(foodCenterX, foodCenterY, glowRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw main food body
        this.ctx.fillStyle = '#e74c3c'; // Red
        this.ctx.beginPath();
        this.ctx.arc(foodCenterX, foodCenterY, pulsedRadius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // NEW: Method to set the *next intended* direction
    setDirection(dx, dy) {
         // Only allow setting direction if the game isn't over
        if (this.isGameOver) return;

        // Basic check to prevent immediate 180 turns if snake has length > 1
        // This check is refined in the update() loop before applying the direction
        const isOppositeX = dx === -this.direction.x && dy === 0 && this.direction.x !== 0;
        const isOppositeY = dy === -this.direction.y && dx === 0 && this.direction.y !== 0;

        if (this.snake.length > 1 && (isOppositeX || isOppositeY)) {
            // console.log("Ignoring opposite direction"); // Optional debug log
            return; // Ignore direct reversal if snake is longer than 1 segment
        }

        // Store the desired direction. It will be applied in the next `update` cycle.
        // This prevents issues with multiple direction changes between game ticks.
        this.pendingDirection = { x: dx, y: dy };
    }


    handleKeyPress(event) {
        if (this.isGameOver && event.key === ' ') {
             this.startGame();
             return; // Exit after starting game
        }
        if (this.isGameOver) return; // Ignore movement keys if game is over

        switch(event.key) {
            case 'ArrowUp':
            case 'w': // Add WASD support
                this.setDirection(0, -1);
                break;
            case 'ArrowDown':
            case 's': // Add WASD support
                this.setDirection(0, 1);
                break;
            case 'ArrowLeft':
            case 'a': // Add WASD support
                this.setDirection(-1, 0);
                break;
            case 'ArrowRight':
            case 'd': // Add WASD support
                this.setDirection(1, 0);
                break;
            // Spacebar for restart is handled at the top of the function
        }
    }

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        this.gameLoop = null; // Clear reference
        this.gameOverElement.style.display = 'block';

        // Play game over sound after a short delay
        setTimeout(() => {
            this.playSound('gameover');
        }, 100); // 100ms delay
    }

    updateScore() {
        this.scoreElement.textContent = `Score: ${this.score}`;
    }
}

// Initialize the game when the window loads
window.onload = () => {
    // Small delay to potentially help with sound loading/autoplay restrictions
    // Although direct user interaction (like the first button press) is often required
    // setTimeout(() => {
        new SnakeGame();
    // }, 100);
};