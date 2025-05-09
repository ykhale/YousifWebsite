const canvas = document.getElementById('flappyCanvas');
const ctx = canvas.getContext('2d');

// Game constants - Made even easier
const GRAVITY = 0.2; // Reduced from 0.3
const JUMP_FORCE = -6; // Reduced from -8
const PIPE_SPEED = 1.2; // Reduced from 1.5
const PIPE_SPAWN_RATE = 2500; // Increased from 2000
const PIPE_GAP = 250; // Increased from 200

// Sound effects
const jumpSound = new Audio();
jumpSound.src = 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==';
const scoreSound = new Audio();
scoreSound.src = 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==';
const gameOverSound = new Audio();
gameOverSound.src = 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==';

// Game objects
const bird = {
    x: 100,
    y: canvas.height / 2,
    width: 40,
    height: 40,
    velocity: 0,
    image: new Image()
};

// Load the bird image
bird.image.src = './assets/me.jpeg';

const pipes = [];
let score = 0;
let gameOver = false;
let lastPipeSpawn = 0;
let highScore = localStorage.getItem('flappyHighScore') || 0;

// Event listeners
canvas.addEventListener('click', () => {
    if (gameOver) {
        resetGame();
    } else {
        jump();
    }
});

// Space key for jumping too
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        if (gameOver) {
            resetGame();
        } else {
            jump();
        }
    }
});

function jump() {
    bird.velocity = JUMP_FORCE;
    jumpSound.currentTime = 0;
    jumpSound.play().catch(e => console.log('Audio play failed:', e));
}

function createPipe() {
    const gapPosition = Math.random() * (canvas.height - PIPE_GAP - 200) + 100; // More centered gaps
    pipes.push({
        x: canvas.width,
        topHeight: gapPosition,
        bottomY: gapPosition + PIPE_GAP,
        width: 80,
        passed: false
    });
}

function drawPipe(x, height, isTop) {
    ctx.fillStyle = '#2E8B57'; // Main pipe color
    
    if (isTop) {
        // Draw top pipe
        ctx.fillRect(x, 0, 80, height);
        // Draw rim
        ctx.fillStyle = '#228B22';
        ctx.fillRect(x - 5, height - 20, 90, 20);
    } else {
        // Draw bottom pipe
        ctx.fillRect(x, height, 80, canvas.height - height);
        // Draw rim
        ctx.fillStyle = '#228B22';
        ctx.fillRect(x - 5, height, 90, 20);
    }
}

function update() {
    if (gameOver) return;

    // Update bird
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    // Check for collisions with top and bottom
    if (bird.y <= 0 || bird.y + bird.height >= canvas.height) {
        endGame();
    }

    // Update pipes
    const currentTime = Date.now();
    if (currentTime - lastPipeSpawn > PIPE_SPAWN_RATE) {
        createPipe();
        lastPipeSpawn = currentTime;
    }

    // Move and check pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        pipe.x -= PIPE_SPEED;

        // Check for collision
        if (bird.x + bird.width > pipe.x && 
            bird.x < pipe.x + pipe.width) {
            if (bird.y < pipe.topHeight || 
                bird.y + bird.height > pipe.bottomY) {
                endGame();
            }
        }

        // Check if pipe is passed
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            pipe.passed = true;
            score++;
            scoreSound.currentTime = 0;
            scoreSound.play().catch(e => console.log('Audio play failed:', e));
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('flappyHighScore', highScore);
            }
        }

        // Remove pipes that are off screen
        if (pipe.x + pipe.width < 0) {
            pipes.splice(i, 1);
        }
    }
}

function endGame() {
    gameOver = true;
    gameOverSound.currentTime = 0;
    gameOverSound.play().catch(e => console.log('Audio play failed:', e));
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB'; // Sky blue background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(100, 50, 30, 0, Math.PI * 2);
    ctx.arc(130, 50, 40, 0, Math.PI * 2);
    ctx.arc(160, 50, 30, 0, Math.PI * 2);
    ctx.fill();

    // Draw bird with rotation based on velocity
    ctx.save();
    ctx.translate(bird.x + bird.width/2, bird.y + bird.height/2);
    ctx.rotate(Math.min(Math.max(bird.velocity * 0.05, -0.5), 0.5)); // Limit rotation
    ctx.drawImage(bird.image, -bird.width/2, -bird.height/2, bird.width, bird.height);
    ctx.restore();

    // Draw pipes
    pipes.forEach(pipe => {
        drawPipe(pipe.x, pipe.topHeight, true);
        drawPipe(pipe.x, pipe.bottomY, false);
    });

    // Draw score
    ctx.fillStyle = '#000';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(score.toString(), canvas.width / 2, 50);

    // Draw high score
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, 90);

    // Draw game over message
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 80);
        ctx.fillText('Click or Press Space to Play Again', canvas.width / 2, canvas.height / 2 + 120);
    }
}

function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    gameOver = false;
    lastPipeSpawn = Date.now();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop(); 