import {
  PLAYFIELD_COLUMNS,
  PLAYFIELD_ROWS,
  NEXTFIELD_COLUMNS,
  NEXTFIELD_ROWS,
  TETROMINO_NAMES,
  TETROMINOES,
  gameOverBlock,
  getRandomElement,
  convertPositionToIndex,
} from "./utilities.js";

let playfield;
let tetromino;

let nextTetroField;
let nextTetromino;

let timeoutId;
let requestId;

let autoDrop;
let isPaused = false;

let isGameOver = false;

let currentShape = 0;

let cells;
let cellsNext;

let topScore = getTopScore() || 0;
let currentScore = 0;

// init();

function init() {
  isGameOver = false;
  isPaused = false;
  //   if (isGameOver === true) {
  toggleGameOverDisplay();
  //   }
  generateNextField();
  restartGame();
  generateTetromino(true);
  drawNextTetromino(nextTetromino);
}

//=================================================

// functions generate playfield and tetromino

function generatePlayfield() {
  const tetris = document.querySelector(".tetris"); // delete divs
  tetris.innerHTML = "";
  playfield = [];

  for (let i = 0; i < PLAYFIELD_ROWS; i++) {
    const row = [];
    for (let j = 0; j < PLAYFIELD_COLUMNS; j++) {
      const div = document.createElement("div");
      tetris.append(div);
      row.push(div);
    }
    playfield.push(row);
  }
}

function generateNextField() {
  const nextField = document.querySelector(".next-field");
  nextField.innerHTML = "";

  nextTetroField = new Array(NEXTFIELD_ROWS)
    .fill()
    .map(() => new Array(NEXTFIELD_COLUMNS).fill(0));

  for (let i = 0; i < NEXTFIELD_ROWS; i++) {
    for (let j = 0; j < NEXTFIELD_COLUMNS; j++) {
      const div = document.createElement("div");
      nextField.append(div);
      nextTetroField[i][j] = div;
    }
  }

  cellsNext = document.querySelectorAll(".next-field div");

  cellsNext.forEach((cell) => {
    cell.className = "";
    cell.style.backgroundColor = "";
  });
}

function generateTetromino(isFirst) {
  const nameTetro = getRandomElement(TETROMINO_NAMES);
  const matrixTetro = TETROMINOES[nameTetro];

  const nameNextTetro = getRandomElement(TETROMINO_NAMES);
  const matrixNextTetro = TETROMINOES[nameNextTetro];

  const rowTetro = -2;
  const columnTetro = Math.floor(
    PLAYFIELD_COLUMNS / 2 - matrixTetro[0].length / 2
  );
  const columnNextTetro = Math.floor(
    PLAYFIELD_COLUMNS / 2 - matrixNextTetro[0].length / 2
  );

  tetromino = {
    name: nameTetro,
    matrix: matrixTetro,
    row: rowTetro,
    column: columnTetro,
  };

  nextTetromino = {
    name: nameNextTetro,
    matrix: matrixNextTetro,
    row: rowTetro,
    column: columnNextTetro,
  };

  if (isFirst) {
    tetromino = nextTetromino;
  }
}

//===========================================================

document.addEventListener("DOMContentLoaded", function () {
  const restartButton = document.querySelector(".restart__button");
  const pauseButton = document.querySelector(".pause__button");

  const outsideRestartButton = document.querySelector(
    ".outside_button.restart__button"
  );

  const leftButton = document.querySelector(".left__button");
  const rightButton = document.querySelector(".right__button");
  const downButton = document.querySelector(".down__button");
  const rotateButton = document.querySelector(".rotate__button");
  const dropButton = document.querySelector(".drop__button");

  restartButton.addEventListener("click", function () {
    restartGame();
  });
  pauseButton.addEventListener("click", pauseGame);

  outsideRestartButton.addEventListener("click", function () {
    init();
  });

  leftButton.addEventListener("click", moveTetrominoLeft);
  rightButton.addEventListener("click", moveTetrominoRight);
  downButton.addEventListener("click", moveTetrominoDown);
  rotateButton.addEventListener("click", rotateTetromino);
  dropButton.addEventListener("click", dropTetrominoDown);
});

//==============================================

// keydown events

document.addEventListener("keydown", onKeyDown);

function onKeyDown(event) {
  //   console.log(event);

  if (
    event.key === "p" ||
    event.key === "Pause" ||
    event.key === "PauseBreak"
  ) {
    pauseGame();
  }
  if (isPaused) {
    return;
  }

  switch (event.key) {
    case " ":
      dropTetrominoDown();
      break;
    case "ArrowDown":
      //   console.log("ArrowDown");
      moveTetrominoDown();
      break;
    case "ArrowUp":
      //   console.log("ArrowUp");
      rotateTetromino();
      break;
    case "ArrowLeft":
      //   console.log("ArrowLeft");
      moveTetrominoLeft();
      break;
    case "ArrowRight":
      //   console.log("ArrowRight");
      moveTetrominoRight();
      break;
  }
  draw();
}

function moveTetrominoDown() {
  if (!tetromino || isPaused) {
    return;
  }
  if (isGameOver) {
    // gameOver();
    return;
  }

  tetromino.row += 1;
  if (isValid()) {
    tetromino.row -= 1;
    placeTetromino();
  } else {
    isGameRealOver();
  }
}

// function moveTetrominoUp() {
//   tetromino.row -= 1;
//   if (isOutsideOfGameBoard()) {
//     tetromino.row += 1;
//   }
//   draw();
// }

function dropTetrominoDown() {
  if (!tetromino || isPaused) {
    return;
  }

  //   console.log("Before drop:", tetromino);
  while (!isValid()) {
    tetromino.row++;
  }
  //   console.log("After drop:", tetromino);
  tetromino.row--;
  placeTetromino();
}

function moveTetrominoLeft() {
  if (!tetromino || isPaused) {
    return;
  }

  tetromino.column -= 1;
  if (isValid()) {
    tetromino.column += 1;
  }
  draw();
}

function moveTetrominoRight() {
  if (!tetromino || isPaused) {
    return;
  }

  tetromino.column += 1;
  if (isValid()) {
    tetromino.column -= 1;
  }
  draw();
}

//============================

// function moveDown() {
//   moveTetrominoDown();
//   draw();
//   stopLoop();
//   startLoop();
//   if (isGameOver) {
//     gameOver();
//   }
// }

// function startLoop() {
//   timeoutId = setTimeout(
//     () => (requestId = requestAnimationFrame(moveDown)),
//     700
//   );
// }

// function stopLoop() {
//   cancelAnimationFrame(requestId);
//   timeoutId = clearTimeout(timeoutId);
// }

// function togglePauseGame() {
//   isPaused = !isPaused;
//   if (isPaused) {
//     stopLoop();
//   } else {
//     startLoop();
//   }
// }

function pauseGame() {
  if (!isPaused) {
    clearInterval(autoDrop);
    isPaused = true;
  } else {
    autoDrop = setInterval(() => {
      moveTetrominoDown();
      draw();
    }, 1000);
    isPaused = false;
  }
  draw();
}

function restartGame() {
  clearPlayfield();
  currentScore = 0;
  updateScoreBoard();

  generateTetromino(true);
  generateTetromino(false);

  if (autoDrop) {
    clearInterval(autoDrop);
  }
  autoDrop = setInterval(() => {
    moveTetrominoDown();
    draw();
  }, 1000);
}

function gameOver() {
  updateTopScore();
  clearInterval(autoDrop);
  isGameOver = true;
  toggleGameOverDisplay();

  tetromino = null;
  draw();
}

function isGameRealOver() {
  if (!tetromino) {
    return;
  }

  const matrixSize = tetromino.matrix.length;
  for (let row = 0; row < matrixSize; row++) {
    for (let column = 0; column < matrixSize; column++) {
      if (!tetromino.matrix[row][column]) {
        continue;
      }

      if (
        tetromino.row + row >= 0 &&
        playfield[tetromino.row + row] &&
        playfield[tetromino.row + row][tetromino.column + column]
      ) {
        gameOver();
        return;
      }
    }
  }
}

function toggleGameOverDisplay() {
  const gameOverBlock = document.getElementById("gameOverBlock");
  const display = getComputedStyle(gameOverBlock).display;

  if (display === "flex") {
    gameOverBlock.style.display = "none";

    restartGame();
  } else {
    gameOverBlock.style.display = "flex";
  }
}

restartGame();

//===========================================================

// function rotateMatrix(matrix) {
//   const rows = matrix.length;
//   const columns = matrix[0].length;
//   const rotatedMatrix = [];

//   for (let column = 0; column < columns; column++) {
//     const newRow = [];
//     for (let row = rows - 1; row >= 0; row--) {
//       newRow.push(matrix[row][column]);
//     }
//     rotatedMatrix.push(newRow);
//   }

//   return rotatedMatrix;
// }

generatePlayfield();

cells = document.querySelectorAll(".tetris div");
cellsNext = document.querySelectorAll(".next-field div");
// console.log(cells);

//=============================================

// draw

function drawPlayfield() {
  for (let row = 0; row < PLAYFIELD_ROWS; row++) {
    for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
      if (playfield[row][column] == 0) {
        continue;
      }
      const name = playfield[row][column];
      const cellIndex = convertPositionToIndex(row, column);
      cells[cellIndex].classList.add(name);
    }
  }
}

function drawTetromino() {
  if (!tetromino) {
    return;
  }

  const { name, color } = tetromino;
  const tetrominoMatrixSize = tetromino.matrix.length;

  for (let row = 0; row < tetrominoMatrixSize; row++) {
    for (let column = 0; column < tetrominoMatrixSize; column++) {
      if (tetromino.matrix[row][column] === 0) {
        continue;
      }

      const rotateTetro = autoRotateTetromino(column, row, currentShape);

      const cellIndex = convertPositionToIndex(
        tetromino.row + rotateTetro.y,
        tetromino.column + rotateTetro.x
      );

      const cell = cells[cellIndex];
      if (cell) {
        cell.classList.add(name);
        cell.style.backgroundColor = color;
      }
    }
  }
}

function drawNextTetromino() {
  const name = nextTetromino.name;
  const tetrominoMatrixSize = nextTetromino.matrix.length;

  for (let row = 0; row < tetrominoMatrixSize; row++) {
    for (let column = 0; column < tetrominoMatrixSize; column++) {
      if (nextTetromino.matrix[row][column] == 0) {
        continue;
      }
      const cellIndex = row * NEXTFIELD_COLUMNS + column; // right shape of nextFigure
      const cell = cellsNext[cellIndex];

      if (cell) {
        cell.className = ""; // delete all classes
        cell.classList.add(name);
      }
    }
  }
}

function draw() {
  setTimeout(() => {
    updateTetrominoIndex();
  }, 0);
}

//=======================================================

function updateTetrominoIndex() {
  cells.forEach((cell) => {
    cell.removeAttribute("class");
    cell.style.backgroundColor = "";
  });

  drawTetromino();
  drawPlayfield();
  drawNextTetromino(nextTetromino);
}
// ====================================================

function autoRotateTetromino(x, y, shape) {
  switch (shape % 4) {
    case 0:
      return { x, y }; // 0 degrees
    case 1:
      return { x: y, y: -x }; // 90 degrees
    case 2:
      return { x: -x, y: -y }; // 180 degrees
    case 3:
      return { x: -y, y: x }; // 270 degrees
  }
}

function getRandomColor() {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return "#" + randomColor;
}

drawTetromino();
drawNextTetromino(nextTetromino);

function isValid() {
  const matrixSize = tetromino.matrix.length;
  for (let row = 0; row < matrixSize; row++) {
    for (let column = 0; column < matrixSize; column++) {
      if (!tetromino.matrix[row][column]) {
        continue;
      }
      if (isOutsideOfGameBoard(row, column) || hasCollisions(row, column)) {
        return true;
      }
    }
  }
  return false;
}

function isOutsideOfGameBoard(row, column) {
  return (
    tetromino.column + column < 0 ||
    tetromino.column + column >= PLAYFIELD_COLUMNS ||
    tetromino.row + row >= playfield.length
  );
}

function hasCollisions(row, column) {
  //   if (
  //     playfield[tetromino.row + row] &&
  //     playfield[tetromino.row + row][tetromino.column + column]
  //   ) {
  //     return true;
  //   }
  //   return false;

  return playfield[tetromino.row + row]?.[tetromino.column + column];
}

function placeTetromino() {
  const matrixSize = tetromino.matrix.length;

  for (let row = 0; row < matrixSize; row++) {
    for (let column = 0; column < matrixSize; column++) {
      if (!tetromino.matrix[row][column]) continue;

      const tetroColumn = tetromino.column + column;
      const tetroRow = tetromino.row + row;

      if (tetroRow < -1) {
        gameOver();
        return;
      }

      if (playfield[tetroRow] && playfield[tetroColumn] !== undefined) {
        playfield[tetroRow][tetroColumn] = tetromino.name;
      }
    }
    // draw();
  }

  const filledRows = findFilledRows();

  //   console.log(filledRows);
  setTimeout(() => {
    generateNextField();
    removeFilledRows(filledRows);
    drawNextTetromino(nextTetromino);
  }, 300);

  tetromino = nextTetromino;

  //   currentShape++;
  generateTetromino(true);
  isGameRealOver();
  updateTetrominoIndex();
}

function removeFilledRows(filledRows) {
  //   filledRows.forEach((row) => {
  //     dropRowsAbove(row);
  //   });

  const filledRowsCount = filledRows.length;

  switch (filledRowsCount) {
    case 1:
      currentScore += 10;
      break;
    case 2:
      currentScore += 25;
      break;
    case 3:
      currentScore += 50;
      break;
    case 4:
      currentScore += 100;
      break;
  }

  for (let i = 0; i < filledRows.length; i++) {
    const row = filledRows[i];
    dropRowsAbove(row);
  }
  updateScoreBoard();
}

function dropRowsAbove(rowDelete) {
  for (let row = rowDelete; row > 0; row--) {
    playfield[row] = playfield[row - 1];
  }

  playfield[0] = new Array(PLAYFIELD_COLUMNS).fill(0);
}

function clearPlayfield() {
  playfield = new Array(PLAYFIELD_ROWS)
    .fill()
    .map(() => new Array(PLAYFIELD_COLUMNS).fill(0));

  draw();
}

// let array = [
//   [1, 2, 3],
//   [4, 5, 6],
//   [7, 8, 9],
// ];

function rotateTetromino() {
  if (!tetromino || isPaused) {
    return;
  }

  const oldMatrix = tetromino.matrix;
  const rotatedMatrix = rotateMatrix(tetromino.matrix);
  tetromino.matrix = rotatedMatrix;
  if (isValid()) {
    tetromino.matrix = oldMatrix;
  }
  draw();

  const rotatedNextMatrix = rotateMatrix(nextTetromino.matrix);
  drawNextTetromino(nextTetromino, rotatedNextMatrix);
}

function rotateMatrix(matrix) {
  const N = matrix.length;
  const rotatedMatrix = [];

  for (let i = 0; i < N; i++) {
    rotatedMatrix[i] = [];
    for (let j = 0; j < N; j++) {
      rotatedMatrix[i][j] = matrix[N - j - 1][i];
    }
  }

  return rotatedMatrix;
}

//==========================================

// score

function findFilledRows() {
  const filledRows = [];
  for (let row = 0; row < PLAYFIELD_ROWS; row++) {
    // let filledColumns = 0;
    // for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
    //   if (playfield[row][column] !== 0) {
    //     filledColumns++;
    //   }
    // }
    let filledColumns = playfield[row].filter((column) => column !== 0).length;
    //====================
    if (PLAYFIELD_COLUMNS == filledColumns) {
      filledRows.push(row);
    }
  }
  return filledRows;
}

function getScoreBoard() {
  document.querySelector(".topScore").textContent = `${topScore}`;
  document.querySelector(".score").textContent = `${currentScore}`;
  document.querySelector(
    ".outside-score__banner .score"
  ).textContent = `${currentScore}`;
}

function updateTopScore() {
  if (currentScore > topScore) {
    topScore = currentScore;
    localStorage.setItem("highScore", topScore);
  }
}

function updateScoreBoard() {
  getScoreBoard();
  draw();
}

function getTopScore() {
  return parseInt(localStorage.getItem("highScore"), 10) || 0;
}

//===========================

init();
