const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");
const message = document.getElementById("message");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const box = 20;
const totalBoxes = canvas.width / box;

let snake;
let food;
let direction;
let nextDirection;
let score;
let gameLoop;
let speed;
let running = false;

let highScore = Number(localStorage.getItem("snakeHighScore")) || 0;
highScoreDisplay.innerText = highScore;

function initializeGame() {
    snake = [
        { x: 200, y: 200 },
        { x: 180, y: 200 },
        { x: 160, y: 200 }
    ];

    direction = "RIGHT";
    nextDirection = "RIGHT";
    score = 0;
    speed = 140;

    scoreDisplay.innerText = score;

    createFood();
    drawGame();
}

function createFood() {
    do {
        food = {
            x: Math.floor(Math.random() * totalBoxes) * box,
            y: Math.floor(Math.random() * totalBoxes) * box
        };
    } while (snake.some(part =>
        part.x === food.x && part.y === food.y
    ));
}

function drawGame() {
    ctx.fillStyle = "#071510";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#183027";
    ctx.lineWidth = 1;

    for (let i = 0; i <= canvas.width; i += box) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = "#ff4757";
    ctx.shadowColor = "#ff4757";
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.arc(
        food.x + box / 2,
        food.y + box / 2,
        box / 2 - 3,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.shadowBlur = 0;

    // Draw snake
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "#b5ff57" : "#39ff88";

        ctx.shadowColor = "#39ff88";
        ctx.shadowBlur = index === 0 ? 12 : 4;

        ctx.fillRect(
            part.x + 2,
            part.y + 2,
            box - 4,
            box - 4
        );
    });

    ctx.shadowBlur = 0;
}

function updateGame() {
    direction = nextDirection;

    const head = { ...snake[0] };

    if (direction === "UP") head.y -= box;
    if (direction === "DOWN") head.y += box;
    if (direction === "LEFT") head.x -= box;
    if (direction === "RIGHT") head.x += box;

    const eating = head.x === food.x && head.y === food.y;

    // Wall collision
    if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= canvas.width ||
        head.y >= canvas.height
    ) {
        endGame();
        return;
    }

    // Self collision
    const body = eating ? snake : snake.slice(0, -1);

    if (body.some(part =>
        part.x === head.x && part.y === head.y
    )) {
        endGame();
        return;
    }

    snake.unshift(head);

    if (eating) {
        score += 10;
        scoreDisplay.innerText = score;

        if (score > highScore) {
            highScore = score;
            localStorage.setItem("snakeHighScore", highScore);
            highScoreDisplay.innerText = highScore;
        }

        createFood();

        // Increase difficulty
        if (speed > 60) {
            speed -= 5;
        }

        clearInterval(gameLoop);
        gameLoop = setInterval(updateGame, speed);

    } else {
        snake.pop();
    }

    drawGame();
}

function changeDirection(newDirection) {
    const opposite = {
        UP: "DOWN",
        DOWN: "UP",
        LEFT: "RIGHT",
        RIGHT: "LEFT"
    };

    if (newDirection !== opposite[direction]) {
        nextDirection = newDirection;
    }
}

function startGame() {
    if (running) return;

    initializeGame();
    running = true;

    message.innerText = "Game Started! Good Luck!";
    gameLoop = setInterval(updateGame, speed);
}

function endGame() {
    clearInterval(gameLoop);
    running = false;

    message.innerText = "GAME OVER! Final Score: " + score;
}

function restartGame() {
    clearInterval(gameLoop);
    running = false;
    startGame();
}

// Keyboard controls
document.addEventListener("keydown", function(event) {

    const keys = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT"
    };

    if (keys[event.key]) {
        event.preventDefault();
        changeDirection(keys[event.key]);
    }

});

// Button controls
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);

// Initial screen
initializeGame();
message.innerText = "Press START to play!";