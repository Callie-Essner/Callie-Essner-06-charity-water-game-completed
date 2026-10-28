const titleScreen = document.querySelector('.title-screen');
const gameScreen = document.querySelector('#game-screen');
const playButton = document.querySelector('#play-button');
const howToPlayButton = document.querySelector('#how-to-play-button');
const howToPlayDialog = document.querySelector('#how-to-play-dialog');
const resultsDialog = document.querySelector('#results-dialog');
const confettiLayer = document.querySelector('#confetti-layer');
const pipeGrid = document.querySelector('#pipe-grid');
const timerCounter = document.querySelector('#timer-counter');
const movesCounter = document.querySelector('#moves-counter');
const impactCounter = document.querySelector('#impact-counter');
const resultsImpactCounter = document.querySelector('#results-impact');
const gameToast = document.querySelector('#game-toast');
const checkFlowButton = document.querySelector('#check-flow-button');
const hintButton = document.querySelector('#hint-button');
const pauseButton = document.querySelector('#pause-button');
const restartButton = document.querySelector('#restart-button');
const pauseOverlay = document.querySelector('#pause-overlay');
const levelNumber = document.querySelector('#level-number');
const resultsEyebrow = document.querySelector('#results-eyebrow');
const nextLevelButton = document.querySelector('#next-level-button');
const retryButton = document.querySelector('#retry-button');

const gameDuration = 120;
const startingMoves = 40;
const hintCost = 10;
const directions = ['N', 'E', 'S', 'W'];
const nextCell = {
    N: { row: -1, column: 0 },
    E: { row: 0, column: 1 },
    S: { row: 1, column: 0 },
    W: { row: 0, column: -1 }
};
const oppositeDirection = { N: 'S', E: 'W', S: 'N', W: 'E' };

// The route snakes through every tile, starting top-left and ending top-right.
const puzzleLayout = [
    [
        { type: 'elbow', solution: 2, isRoute: true },
        { type: 'elbow', solution: 1, isRoute: true },
        { type: 'elbow', solution: 2, isRoute: true, scramble: true },
        { type: 'elbow', solution: 1, isRoute: true }
    ],
    [
        { type: 'line', solution: 0, isRoute: true },
        { type: 'line', solution: 0, isRoute: true },
        { type: 'line', solution: 0, isRoute: true },
        { type: 'line', solution: 0, isRoute: true }
    ],
    [
        { type: 'line', solution: 0, isRoute: true },
        { type: 'line', solution: 0, isRoute: true },
        { type: 'line', solution: 0, isRoute: true },
        { type: 'line', solution: 0, isRoute: true }
    ],
    [
        { type: 'elbow', solution: 0, isRoute: true },
        { type: 'elbow', solution: 3, isRoute: true },
        { type: 'elbow', solution: 0, isRoute: true },
        { type: 'elbow', solution: 3, isRoute: true }
    ]
];

const levelTwoLayout = [
    [
        { type: 'elbow', solution: 2, isRoute: true },
        { type: 'elbow', solution: 1, isRoute: true },
        { type: 'line', solution: 1, isRoute: true },
        { type: 'line', solution: 1, isRoute: true }
    ],
    [
        { type: 'line', solution: 0, isRoute: true },
        { type: 'elbow', solution: 0, isRoute: true },
        { type: 'line', solution: 1, isRoute: true, scramble: true },
        { type: 'elbow', solution: 2, isRoute: true }
    ],
    [
        { type: 'line', solution: 0, isRoute: true },
        { type: 'elbow', solution: 1, isRoute: true },
        { type: 'elbow', solution: 2, isRoute: true, scramble: true },
        { type: 'line', solution: 0, isRoute: true }
    ],
    [
        { type: 'elbow', solution: 0, isRoute: true },
        { type: 'elbow', solution: 3, isRoute: true, scramble: true },
        { type: 'elbow', solution: 0, isRoute: true },
        { type: 'elbow', solution: 3, isRoute: true }
    ]
];

let board = [];
let currentLevel = 0;
let hintsUsed = 0;
let timeRemaining = gameDuration;
let movesRemaining = startingMoves;
let impact = 0;
let isPaused = false;
let isFinished = false;
let isFlowing = false;
let timerId = null;
let flowTimeoutId = null;
let toastTimeoutId = null;
let impactAnimationId = null;

// Rotate a pipe's north/east-facing base shape to find its open ends.
function getConnections(tile, rotation = tile.rotation) {
    const baseConnections = tile.type === 'line' ? ['N', 'S'] : ['N', 'E'];

    return baseConnections.map((direction) => {
        const directionIndex = directions.indexOf(direction);
        return directions[(directionIndex + rotation) % directions.length];
    });
}

function isTileCorrect(tile) {
    const current = getConnections(tile).sort().join('');
    const solution = getConnections(tile, tile.solution).sort().join('');

    return current === solution;
}

function makeBoard() {
    const layout = currentLevel === 0 ? puzzleLayout : levelTwoLayout;

    board = layout.map((row) => row.map((tile) => {
        let rotation = tile.solution;

        if (tile.scramble) {
            const rotationCount = tile.type === 'line' ? 2 : 4;
            rotation = (tile.solution + 1) % rotationCount;
        } else if (!tile.isRoute) {
            rotation = Math.floor(Math.random() * 4);
        }

        return { ...tile, rotation };
    }));
}

function drawTile(tile, row, column) {
    const button = document.createElement('button');
    const shapeName = tile.type === 'line' ? 'straight' : 'corner';
    let positionName = 'Pipe tile';

    button.className = `pipe-tile pipe-${tile.type}`;

    if (tile.isRoute) {
        button.classList.add('is-route');
        positionName = 'Route pipe';
    }

    if (row === 0 && column === 0) {
        button.classList.add('is-source');
        positionName = 'Water source, top-left start';
    } else if (row === 0 && column === 3) {
        button.classList.add('is-destination');
        positionName = 'Community destination, top-right end';
    }

    button.type = 'button';
    button.dataset.row = row;
    button.dataset.column = column;
    button.style.setProperty('--rotation', `${tile.rotation * 90}deg`);
    button.setAttribute('aria-label', `${positionName}, row ${row + 1}, column ${column + 1}, ${shapeName} pipe`);
    button.innerHTML = '<span class="pipe-shape" aria-hidden="true"><i></i><i></i></span>';

    return button;
}

function renderBoard() {
    pipeGrid.innerHTML = '';

    board.forEach((row, rowIndex) => {
        row.forEach((tile, columnIndex) => {
            pipeGrid.append(drawTile(tile, rowIndex, columnIndex));
        });
    });
}

function clearTileHighlights() {
    pipeGrid.querySelectorAll('.pipe-tile').forEach((tileButton) => {
        tileButton.classList.remove('is-hint', 'is-flowing');
    });
}

function updateCounters() {
    timerCounter.textContent = formatTime(timeRemaining);
    movesCounter.textContent = movesRemaining;
    impactCounter.textContent = impact;
    updateHintButton();
}

function animateImpactIncrease(startValue, endValue) {
    clearInterval(impactAnimationId);

    const animationDuration = 1200;
    const animationStart = Date.now();

    impactCounter.classList.add('is-counting');
    resultsImpactCounter.classList.add('is-counting');

    const updateImpactDisplay = () => {
        const progress = Math.min((Date.now() - animationStart) / animationDuration, 1);
        const displayedImpact = Math.round(startValue + (endValue - startValue) * progress);

        impactCounter.textContent = displayedImpact;
        resultsImpactCounter.textContent = displayedImpact;

        if (progress >= 1) {
            clearInterval(impactAnimationId);
            impactAnimationId = null;
            impactCounter.classList.remove('is-counting');
            resultsImpactCounter.classList.remove('is-counting');
        }
    };

    updateImpactDisplay();
    impactAnimationId = window.setInterval(updateImpactDisplay, 24);
}

function updateHintButton() {
    const firstHintIsFree = hintsUsed === 0;

    hintButton.disabled = !firstHintIsFree && impact < hintCost;
    hintButton.title = firstHintIsFree ? 'Hint (first use free)' : 'Hint (costs 10 Impact points)';
    hintButton.setAttribute('aria-label', firstHintIsFree ? 'Get a free hint' : 'Get a hint for 10 Impact points');
}

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function showToast(message, isProminent = false) {
    clearTimeout(toastTimeoutId);
    gameToast.textContent = message;
    gameToast.classList.toggle('is-prominent', isProminent);
    gameToast.hidden = false;

    toastTimeoutId = window.setTimeout(() => {
        gameToast.hidden = true;
        toastTimeoutId = null;
    }, 2600);
}

function clearConfetti() {
    confettiLayer.hidden = true;
    confettiLayer.innerHTML = '';
}

function celebrateWin() {
    const colors = ['#ffc907', '#2e9df7', '#4fcb53', '#ff902a', '#f16061'];

    clearConfetti();

    for (let index = 0; index < 36; index += 1) {
        const piece = document.createElement('span');

        piece.className = 'confetti-piece';
        piece.style.setProperty('--confetti-x', `${Math.random() * 100}%`);
        piece.style.setProperty('--confetti-delay', `${Math.random() * 350}ms`);
        piece.style.setProperty('--confetti-drift', `${Math.round(Math.random() * 160 - 80)}px`);
        piece.style.setProperty('--confetti-fall', `${Math.round(150 + Math.random() * 220)}px`);
        piece.style.setProperty('--confetti-spin', `${Math.round(360 + Math.random() * 720)}deg`);
        piece.style.setProperty('--confetti-color', colors[index % colors.length]);
        confettiLayer.append(piece);
    }

    confettiLayer.hidden = false;
}

// Follow matching pipe openings from the source until the community is reached.
function traceFlow() {
    const queue = [{ row: 0, column: 0, entry: 'W', path: [] }];
    const visited = new Set();
    let destinationReached = false;

    while (queue.length > 0) {
        const current = queue.shift();
        const cellKey = `${current.row},${current.column}`;

        if (visited.has(cellKey)) {
            continue;
        }

        const tile = board[current.row][current.column];
        const connections = getConnections(tile);

        if (!connections.includes(current.entry)) {
            continue;
        }

        visited.add(cellKey);
        const path = [...current.path, cellKey];

        if (current.row === 0 && current.column === 3 && connections.includes('E')) {
            destinationReached = true;
        }

        connections.forEach((direction) => {
            if (direction === current.entry) {
                return;
            }

            const step = nextCell[direction];
            const nextRow = current.row + step.row;
            const nextColumn = current.column + step.column;

            if (nextRow < 0 || nextRow > 3 || nextColumn < 0 || nextColumn > 3) {
                return;
            }

            const neighbor = board[nextRow][nextColumn];
            const neighborConnections = getConnections(neighbor);

            if (neighborConnections.includes(oppositeDirection[direction])) {
                queue.push({
                    row: nextRow,
                    column: nextColumn,
                    entry: oppositeDirection[direction],
                    path
                });
            }
        });
    }

    if (destinationReached && visited.size === 16) {
        return [...visited];
    }

    return null;
}

function showHint() {
    if (isPaused || isFinished || isFlowing) {
        return;
    }

    if (hintsUsed > 0 && impact < hintCost) {
        return;
    }

    if (hintsUsed > 0) {
        impact -= hintCost;
    }

    hintsUsed += 1;
    updateCounters();
    clearTileHighlights();

    for (let row = 0; row < board.length; row += 1) {
        for (let column = 0; column < board[row].length; column += 1) {
            const tile = board[row][column];

            if (tile.isRoute && !isTileCorrect(tile)) {
                const tileButton = pipeGrid.querySelector(`[data-row="${row}"][data-column="${column}"]`);
                tileButton.classList.add('is-hint');
                showToast('Turn the highlighted pipe.', true);
                return;
            }
        }
    }

    showToast('The route is set. Check the flow!', true);
}

function finishGame(didWin) {
    const wonFirstLevel = didWin && currentLevel === 0;
    const previousImpact = impact;
    isFinished = true;
    isFlowing = false;

    if (didWin) {
        impact += 100;
        celebrateWin();
    } else {
        clearConfetti();
    }

    clearInterval(timerId);
    timerId = null;
    clearTimeout(flowTimeoutId);
    flowTimeoutId = null;
    clearTimeout(toastTimeoutId);
    toastTimeoutId = null;
    gameToast.hidden = true;

    document.querySelector('#results-title').textContent = didWin ? 'Water is flowing!' : 'The water stopped.';
    resultsEyebrow.textContent = `LEVEL ${String(currentLevel + 1).padStart(2, '0')}${didWin ? ' COMPLETE' : ''}`;
    document.querySelector('#results-message').textContent = didWin
        ? 'Great work! Clean water is reaching the community.'
        : 'The route is not complete yet. Try again and connect every pipe.';
    resultsImpactCounter.textContent = didWin ? previousImpact : impact;
    document.querySelector('#results-time').textContent = formatTime(gameDuration - timeRemaining);
    document.querySelector('#results-moves').textContent = startingMoves - movesRemaining;
    nextLevelButton.hidden = !wonFirstLevel;
    retryButton.hidden = wonFirstLevel;
    retryButton.textContent = didWin ? 'Play Again' : 'Retry';

    resultsDialog.showModal();

    if (didWin) {
        animateImpactIncrease(previousImpact, impact);
    }
}

function checkFlow() {
    if (isPaused || isFinished || isFlowing) {
        return;
    }

    clearTileHighlights();
    const path = traceFlow();

    if (!path) {
        showToast('The path is broken. Rotate a few pipes and try again.', true);
        return;
    }

    isFlowing = true;

    path.forEach((cellKey) => {
        const [row, column] = cellKey.split(',');
        const tileButton = pipeGrid.querySelector(`[data-row="${row}"][data-column="${column}"]`);
        tileButton.classList.add('is-flowing');
    });

    flowTimeoutId = window.setTimeout(() => finishGame(true), 850);
}

function startTimer() {
    clearInterval(timerId);
    timerId = window.setInterval(() => {
        if (isPaused || isFinished || isFlowing) {
            return;
        }

        timeRemaining -= 1;
        updateCounters();

        if (timeRemaining <= 0) {
            finishGame(false);
        }
    }, 1000);
}

function startGame(levelIndex = currentLevel) {
    clearInterval(timerId);
    clearInterval(impactAnimationId);
    impactAnimationId = null;
    clearTimeout(flowTimeoutId);
    clearTimeout(toastTimeoutId);
    clearConfetti();
    resultsDialog.close();
    impactCounter.classList.remove('is-counting');
    resultsImpactCounter.classList.remove('is-counting');

    if (levelIndex !== currentLevel) {
        hintsUsed = 0;
    }

    currentLevel = levelIndex;
    titleScreen.hidden = true;
    gameScreen.hidden = false;
    gameScreen.classList.remove('is-paused');

    timeRemaining = gameDuration;
    movesRemaining = startingMoves;
    isPaused = false;
    isFinished = false;
    isFlowing = false;
    pauseOverlay.hidden = true;
    gameToast.hidden = true;
    toastTimeoutId = null;
    pauseButton.textContent = '\u275A\u275A';
    pauseButton.setAttribute('aria-label', 'Pause game');
    checkFlowButton.disabled = false;
    levelNumber.textContent = `LEVEL ${String(currentLevel + 1).padStart(2, '0')}`;

    makeBoard();
    renderBoard();
    updateCounters();
    startTimer();
    showToast('Rotate the pipes, then check the flow.', true);
}

function togglePause() {
    if (isFinished || isFlowing) {
        return;
    }

    isPaused = !isPaused;
    pauseOverlay.hidden = !isPaused;
    gameScreen.classList.toggle('is-paused', isPaused);
    pauseButton.textContent = isPaused ? '\u25B6' : '\u275A\u275A';
    pauseButton.setAttribute('aria-label', isPaused ? 'Resume game' : 'Pause game');
    checkFlowButton.disabled = isPaused;

    if (!isPaused) {
        showToast('Game resumed. Keep going!');
    }
}

function returnToTitle() {
    clearInterval(timerId);
    clearInterval(impactAnimationId);
    clearTimeout(flowTimeoutId);
    clearTimeout(toastTimeoutId);
    clearConfetti();
    timerId = null;
    impactAnimationId = null;
    flowTimeoutId = null;
    toastTimeoutId = null;
    impactCounter.classList.remove('is-counting');
    resultsImpactCounter.classList.remove('is-counting');
    gameToast.hidden = true;
    isFinished = true;
    isFlowing = false;
    gameScreen.hidden = true;
    titleScreen.hidden = false;
    playButton.focus();
}

playButton.addEventListener('click', () => startGame(0));

howToPlayButton.addEventListener('click', () => {
    howToPlayDialog.showModal();
});

pipeGrid.addEventListener('click', (event) => {
    const tileButton = event.target.closest('.pipe-tile');

    if (!tileButton || isPaused || isFinished || isFlowing) {
        return;
    }

    const row = Number(tileButton.dataset.row);
    const column = Number(tileButton.dataset.column);
    const tile = board[row][column];

    clearTileHighlights();
    tile.rotation = (tile.rotation + 1) % 4;
    movesRemaining -= 1;

    const updatedTile = drawTile(tile, row, column);
    pipeGrid.replaceChild(updatedTile, tileButton);
    updateCounters();

    if (movesRemaining <= 0) {
        finishGame(false);
    }
});

checkFlowButton.addEventListener('click', checkFlow);
hintButton.addEventListener('click', showHint);
pauseButton.addEventListener('click', togglePause);
restartButton.addEventListener('click', () => startGame(currentLevel));
document.querySelector('#game-home-button').addEventListener('click', returnToTitle);

nextLevelButton.addEventListener('click', () => startGame(1));
retryButton.addEventListener('click', () => startGame());
document.querySelector('#results-home-button').addEventListener('click', () => {
    resultsDialog.close();
    returnToTitle();
});

resultsDialog.addEventListener('cancel', (event) => {
    event.preventDefault();
});