class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.gameOverElement = document.getElementById('game-over');
        
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
        this.direction = {x: 0, y: 0};
        this.score = 0;
        this.gameSpeed = 100;
        this.gameLoop = null;
        this.isGameOver = false;
        
        // Animation settings
        this.lastTime = 0;
        this.foodAnimationDuration = 1000; // 1 second for full animation cycle

        // Bind event listeners
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // Start the game and animation
        this.startGame();
        this.animate();
    }

    setupSounds() {
        // Create eating sound with better initialization
        this.eatSound = new Audio();
        this.eatSound.src = 'eat.mp3';
        this.eatSound.preload = 'auto';
        this.eatSound.volume = 0.4; // Set eating sound to 40% volume
        
        // Verify eat sound loading
        this.eatSound.addEventListener('canplaythrough', () => {});
        this.eatSound.addEventListener('error', () => {});

        // Create game over sound with better initialization
        this.gameOverSound = new Audio();
        this.gameOverSound.src = 'gameover.mp3';
        this.gameOverSound.preload = 'auto';
        this.gameOverSound.volume = 0.5; // Set game over sound to 50% volume
        
        // Verify sound loading
        this.gameOverSound.addEventListener('canplaythrough', () => {});
        this.gameOverSound.addEventListener('error', () => {});
    }

    startGame() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.direction = {x: 0, y: 0};
        this.score = 0;
        this.isGameOver = false;
        this.updateScore();
        this.gameOverElement.style.display = 'none';
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
    }

    generateFood() {
        const food = {
            x: Math.floor(Math.random() * this.tileCount),
            y: Math.floor(Math.random() * this.tileCount)
        };
        
        // Make sure food doesn't spawn on snake
        if (this.snake.some(segment => segment.x === food.x && segment.y === food.y)) {
            return this.generateFood();
        }
        
        return food;
    }

    playSound(type = 'eat') {
        try {
            if (type === 'gameover') {
                // Check if the game over sound is properly loaded
                if (this.gameOverSound.readyState >= 2) {
                    this.gameOverSound.currentTime = 0;
                    this.gameOverSound.play().catch(() => {});
                } else {
                    // Try loading again
                    this.gameOverSound.load();
                }
                return;
            }

            // Play eating sound
            if (this.eatSound.readyState >= 2) {
                // Only play if previous sound has finished or hasn't started
                if (this.eatSound.currentTime === 0 || this.eatSound.currentTime >= this.eatSound.duration) {
                    this.eatSound.currentTime = 0;
                    this.eatSound.play().catch(() => {});
                }
            } else {
                this.eatSound.load();
            }
        } catch (error) {
            // Silent error handling
        }
    }

    update() {
        if (this.isGameOver) return;

        // Move snake
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        // Check for collisions
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // Check if snake ate food
        if (head.x === this.food.x && head.y === this.food.y) {
            // Play eating sound
            this.playSound('eat');
            
            this.score += 10;
            this.updateScore();
            this.food = this.generateFood();
            
            // Slow down the snake slightly while eating
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.update(), this.gameSpeed * 1.2);
            
            // Reset speed after eating animation
            setTimeout(() => {
                if (!this.isGameOver) {
                    clearInterval(this.gameLoop);
                    this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
                }
            }, 1000);
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    checkCollision(head) {
        // Wall collision
        if (head.x < 0 || head.x >= this.tileCount || 
            head.y < 0 || head.y >= this.tileCount) {
            return true;
        }

        // Self collision
        return this.snake.some((segment, index) => {
            if (index === 0) return false;
            return segment.x === head.x && segment.y === head.y;
        });
    }

    animate(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Only update and draw if the game is running
        if (!this.isGameOver) {
            this.draw(currentTime);
        }
        
        requestAnimationFrame((time) => this.animate(time));
    }

    draw(timestamp = 0) {
        // Clear canvas
        this.ctx.fillStyle = '#34495e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#2ecc71' : '#27ae60';
            this.ctx.beginPath();
            this.ctx.arc(
                segment.x * this.gridSize + this.gridSize / 2,
                segment.y * this.gridSize + this.gridSize / 2,
                this.gridSize / 2 - 2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            
            // Add eyes to the snake head
            if (index === 0) {
                // Calculate eye positions based on direction
                const eyeOffset = 3;
                let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
                
                if (this.direction.x === 1) { // Moving right
                    leftEyeX = rightEyeX = segment.x * this.gridSize + this.gridSize * 0.75;
                    leftEyeY = segment.y * this.gridSize + this.gridSize * 0.3;
                    rightEyeY = segment.y * this.gridSize + this.gridSize * 0.7;
                } else if (this.direction.x === -1) { // Moving left
                    leftEyeX = rightEyeX = segment.x * this.gridSize + this.gridSize * 0.25;
                    leftEyeY = segment.y * this.gridSize + this.gridSize * 0.3;
                    rightEyeY = segment.y * this.gridSize + this.gridSize * 0.7;
                } else if (this.direction.y === -1) { // Moving up
                    leftEyeX = segment.x * this.gridSize + this.gridSize * 0.3;
                    rightEyeX = segment.x * this.gridSize + this.gridSize * 0.7;
                    leftEyeY = rightEyeY = segment.y * this.gridSize + this.gridSize * 0.25;
                } else if (this.direction.y === 1) { // Moving down
                    leftEyeX = segment.x * this.gridSize + this.gridSize * 0.3;
                    rightEyeX = segment.x * this.gridSize + this.gridSize * 0.7;
                    leftEyeY = rightEyeY = segment.y * this.gridSize + this.gridSize * 0.75;
                } else { // Default (not moving or starting position)
                    leftEyeX = segment.x * this.gridSize + this.gridSize * 0.3;
                    rightEyeX = segment.x * this.gridSize + this.gridSize * 0.7;
                    leftEyeY = rightEyeY = segment.y * this.gridSize + this.gridSize * 0.5;
                }

                // Draw eyes
                this.ctx.fillStyle = 'white';
                this.ctx.beginPath();
                this.ctx.arc(leftEyeX, leftEyeY, 2, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.arc(rightEyeX, rightEyeY, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });

        // Draw food with blinking effect
        const pulseScale = Math.sin(timestamp * 0.005) * 0.2 + 0.8; // Creates a pulsing effect between 0.6 and 1.0
        const baseRadius = this.gridSize / 2 - 2;
        const pulsedRadius = baseRadius * pulseScale;
        
        // Draw outer glow
        const gradient = this.ctx.createRadialGradient(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            pulsedRadius * 0.5,
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            pulsedRadius * 1.5
        );
        gradient.addColorStop(0, '#e74c3c');
        gradient.addColorStop(1, 'rgba(231, 76, 60, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            pulsedRadius * 1.5,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // Draw food
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            pulsedRadius,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }

    handleKeyPress(event) {
        switch(event.key) {
            case 'ArrowUp':
                if (this.direction.y !== 1) {
                    this.direction = {x: 0, y: -1};
                }
                break;
            case 'ArrowDown':
                if (this.direction.y !== -1) {
                    this.direction = {x: 0, y: 1};
                }
                break;
            case 'ArrowLeft':
                if (this.direction.x !== 1) {
                    this.direction = {x: -1, y: 0};
                }
                break;
            case 'ArrowRight':
                if (this.direction.x !== -1) {
                    this.direction = {x: 1, y: 0};
                }
                break;
            case ' ':
                if (this.isGameOver) {
                    this.startGame();
                }
                break;
        }
    }

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        this.gameOverElement.style.display = 'block';
        
        // Add a small delay before playing the game over sound
        setTimeout(() => {
            this.playSound('gameover');
        }, 50);
    }

    updateScore() {
        this.scoreElement.textContent = `Score: ${this.score}`;
    }
}

// Initialize the game
window.onload = () => {
    new SnakeGame();
}; 