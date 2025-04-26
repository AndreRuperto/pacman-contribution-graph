import { CELL_SIZE, GAP_SIZE, GHOSTS, GRID_HEIGHT, GRID_WIDTH, PACMAN_COLOR, PACMAN_COLOR_DEAD, PACMAN_COLOR_POWERUP, WALLS } from './constants.js';
import { MusicPlayer } from './music-player.js';
import { Utils } from './utils.js';
const resizeCanvas = (store) => {
    const canvasWidth = GRID_WIDTH * (CELL_SIZE + GAP_SIZE);
    const canvasHeight = GRID_HEIGHT * (CELL_SIZE + GAP_SIZE) + 20;
    store.config.canvas.width = canvasWidth;
    store.config.canvas.height = canvasHeight;
};
const drawGrid = (store) => {
    const ctx = store.config.canvas.getContext('2d');
    ctx.fillStyle = Utils.getCurrentTheme(store).gridBackground;
    ctx.fillRect(0, 0, store.config.canvas.width, store.config.canvas.height);
    for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            ctx.fillStyle = store.grid[x][y].color;
            ctx.beginPath();
            ctx.roundRect(x * (CELL_SIZE + GAP_SIZE), y * (CELL_SIZE + GAP_SIZE) + 15, CELL_SIZE, CELL_SIZE, 5);
            ctx.fill();
        }
    }
    ctx.fillStyle = Utils.getCurrentTheme(store).wallColor;
    for (let x = 0; x <= GRID_WIDTH; x++) {
        for (let y = 0; y <= GRID_HEIGHT; y++) {
            if (WALLS.horizontal[x][y].active) {
                ctx.fillRect(x * (CELL_SIZE + GAP_SIZE) - GAP_SIZE, y * (CELL_SIZE + GAP_SIZE) - GAP_SIZE + 15, CELL_SIZE + GAP_SIZE, GAP_SIZE);
            }
            if (WALLS.vertical[x][y].active) {
                ctx.fillRect(x * (CELL_SIZE + GAP_SIZE) - GAP_SIZE, y * (CELL_SIZE + GAP_SIZE) - GAP_SIZE + 15, GAP_SIZE, CELL_SIZE + GAP_SIZE);
            }
        }
    }
    ctx.fillStyle = Utils.getCurrentTheme(store).textColor;
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    let lastMonth = '';
    for (let x = 0; x < GRID_WIDTH; x++) {
        if (store.monthLabels[x] !== lastMonth) {
            const xPos = x * (CELL_SIZE + GAP_SIZE) + CELL_SIZE / 2;
            ctx.fillText(store.monthLabels[x], xPos, 10);
            lastMonth = store.monthLabels[x];
        }
    }
};
const drawPacman = (store) => {
    const ctx = store.config.canvas.getContext('2d');
    const x = store.pacman.x * (CELL_SIZE + GAP_SIZE) + CELL_SIZE / 2;
    const y = store.pacman.y * (CELL_SIZE + GAP_SIZE) + CELL_SIZE / 2 + 15;
    const radius = CELL_SIZE / 2;
    if (store.pacman.deadRemainingDuration) {
        ctx.fillStyle = PACMAN_COLOR_DEAD;
    }
    else if (store.pacman.powerupRemainingDuration) {
        ctx.fillStyle = PACMAN_COLOR_POWERUP;
    }
    else {
        ctx.fillStyle = PACMAN_COLOR;
    }
    const mouthAngle = store.pacmanMouthOpen ? 0.35 * Math.PI : 0.1 * Math.PI;
    let startAngle, endAngle;
    switch (store.pacman.direction) {
        case 'up':
            startAngle = 1.5 * Math.PI + mouthAngle;
            endAngle = 1.5 * Math.PI - mouthAngle;
            break;
        case 'down':
            startAngle = 0.5 * Math.PI + mouthAngle;
            endAngle = 0.5 * Math.PI - mouthAngle;
            break;
        case 'left':
            startAngle = Math.PI + mouthAngle;
            endAngle = Math.PI - mouthAngle;
            break;
        case 'right':
        default:
            startAngle = 0 + mouthAngle;
            endAngle = 2 * Math.PI - mouthAngle;
            break;
    }
    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.lineTo(x, y);
    ctx.fill();
};
const preloadedImages = {};
const getLoadedImage = (key, imgDate) => {
    if (!preloadedImages[key]) {
        const image = new Image();
        image.src = imgDate;
        preloadedImages[key] = image;
    }
    return preloadedImages[key];
};
const drawGhosts = (store) => {
    console.log("👻 Ghosts:", store.ghosts);
    store.ghosts.forEach((ghost) => {
        const x = ghost.x * (CELL_SIZE + GAP_SIZE);
        const y = ghost.y * (CELL_SIZE + GAP_SIZE) + 15;
        const size = CELL_SIZE;
        const ctx = store.config.canvas.getContext('2d');
        // Define a chave do ghost ('scared' ou nome)
        const key = ghost.scared ? 'scared' : ghost.name;
        // Define o caminho da imagem de acordo com a direção ou usa a imagem única de "scared"
        const imagePath = ghost.scared
            ? GHOSTS[key].imgDate
            : GHOSTS[key][ghost.direction];
        // Renderiza a imagem correspondente
        ctx.drawImage(getLoadedImage(`${key}_${ghost.direction}`, imagePath), x, y, size, size);
    });
};
const renderGameOver = (store) => {
    const ctx = store.config.canvas.getContext('2d');
    ctx.fillStyle = Utils.getCurrentTheme(store).textColor;
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', store.config.canvas.width / 2, store.config.canvas.height / 2);
};
const drawSoundController = (store) => {
    if (!store.config.enableSounds)
        return;
    const ctx = store.config.canvas.getContext('2d');
    const width = 30, height = 30, left = store.config.canvas.width - width - 10, top = 10;
    ctx.fillStyle = `rgba(0, 0, 0, ${MusicPlayer.getInstance().isMuted ? 0.3 : 0.5})`;
    ctx.beginPath();
    ctx.moveTo(left + 10, top + 10);
    ctx.lineTo(left + 20, top + 5);
    ctx.lineTo(left + 20, top + 25);
    ctx.lineTo(left + 10, top + 20);
    ctx.closePath();
    ctx.fill();
    if (!MusicPlayer.getInstance().isMuted) {
        ctx.strokeStyle = `rgba(0, 0, 0, 0.4)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(left + 25, top + 15, 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(left + 25, top + 15, 8, 0, Math.PI * 2);
        ctx.stroke();
    }
    else {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(left + 25, top + 5);
        ctx.lineTo(left + 5, top + 25);
        ctx.stroke();
    }
};
const listenToSoundController = (store) => {
    if (!store.config.enableSounds)
        return;
    store.config.canvas.addEventListener('click', function (event) {
        const rect = store.config.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left, y = event.clientY - rect.top;
        const width = 30, height = 30, left = store.config.canvas.width - width - 10, top = 10;
        if (x >= left && x <= left + this.width && y >= top && y <= top + this.height) {
            MusicPlayer.getInstance().isMuted ? MusicPlayer.getInstance().unmute() : MusicPlayer.getInstance().mute();
        }
    });
};
export const Canvas = {
    resizeCanvas,
    drawGrid,
    drawPacman,
    drawGhosts,
    renderGameOver,
    drawSoundController,
    listenToSoundController
};
