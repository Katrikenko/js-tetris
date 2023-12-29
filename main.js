const PLAYFIELD_COLUMNS = 10;
const PLAYFIELD_ROWS = 20;

const TETROMINO_NAMES = ["O", "L", "I", "J", "S", "Z", "T", "Q"];

const TETROMINOES = {
  O: [
    [1, 1],
    [1, 1],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  Q: [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
  ],
};

let playfield;
let tetromino;

let timeoutId;
let requestId;

let autoDrop;
let isPaused = false;

let isGameOver = false;
const gameOverBlock = document.querySelector(".game-over");

let currentShape = 0;

let topScore = getTopScore() || 0;
let currentScore = 0;

function init() {
  isGameOver = false;
  toggleGameOverDisplay();
  restartGame();
}

function convertPositionToIndex(row, column) {
  return row * PLAYFIELD_COLUMNS + column;
}

//=================================================

// functions generate playfield and tetromino

function generatePlayfield() {
  //   document.querySelector(".tetris").innerHTML = ""; // delete divs
  for (let i = 0; i < PLAYFIELD_ROWS * PLAYFIELD_COLUMNS; i++) {
    const div = document.createElement("div");
    document.querySelector(".tetris").append(div);
  }

  playfield = new Array(PLAYFIELD_ROWS)
    .fill()
    .map(() => new Array(PLAYFIELD_COLUMNS).fill(0));
  //   console.log(playfield);
}

function generateTetromino() {
  const indexTetro = Math.floor(Math.random() * TETROMINO_NAMES.length);
  const nameTetro = TETROMINO_NAMES[indexTetro];
  const matrixTetro = TETROMINOES[nameTetro];

  const columnTetro = Math.floor(
    (PLAYFIELD_COLUMNS - matrixTetro[0].length) / 2
  );
  const rowTetro = -2;

  const isRotated = Math.random() > 0.5;

  if (isRotated) {
    const rotatedMatrix = rotateMatrix(matrixTetro);
    const maxColumn = PLAYFIELD_COLUMNS - rotatedMatrix[0].length;
    columnTetroRandom = Math.min(columnTetro, maxColumn);
  }

  tetromino = {
    name: nameTetro,
    matrix: isRotated ? rotateMatrix(matrixTetro) : matrixTetro,
    column: columnTetro,
    row: rowTetro,
    color: getRandomColor(),
  };

  currentShape = 0;

  //   console.log("Tetromino generated:", tetromino);
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

  generateTetromino();

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

const cells = document.querySelectorAll(".tetris div");
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

function draw() {
  setTimeout(() => {
    cells.forEach(function (cell) {
      cell.removeAttribute("class");
      cell.style.backgroundColor = "";
    });
    drawPlayfield();
    drawTetromino();
    //   console.table(playfield);
  }, 0);
}

//==============================================

// keydown events

document.addEventListener("keydown", onKeyDown);

function onKeyDown(event) {
  //   console.log(event);

  if (event.key === "p") {
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
  if (!tetromino) {
    return;
  }
  if (isGameOver) {
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
  //   console.log("Before drop:", tetromino);
  while (!isValid()) {
    tetromino.row++;
  }
  //   console.log("After drop:", tetromino);
  tetromino.row--;
  placeTetromino();
}

function moveTetrominoLeft() {
  tetromino.column -= 1;
  if (isValid()) {
    tetromino.column += 1;
  }
  draw();
}

function moveTetrominoRight() {
  tetromino.column += 1;
  if (isValid()) {
    tetromino.column -= 1;
  }
  draw();
}

//=======================================================

function autoRotateTetromino(x, y, shape) {
  switch (shape % 4) {
    case 0:
      return { x, y }; // 0 degrees
    case 1:
      return { x: -y, y: x }; // 90 degrees
    case 2:
      return { x: -x, y: -y }; // 180 degrees
    case 3:
      return { x: y, y: -x }; // 270 degrees
  }
}

function getRandomColor() {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return "#" + randomColor;
}

drawTetromino();

function isValid() {
  const matrixSize = tetromino.matrix.length;
  for (let row = 0; row < matrixSize; row++) {
    for (let column = 0; column < matrixSize; column++) {
      if (!tetromino.matrix[row][column]) {
        continue;
      }
      if (isOutsideOfGameBoard(row, column)) {
        return true;
      }
      if (hasCollisions(row, column)) {
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

      if (playfield[tetroRow] && playfield[tetroColumn] !== undefined) {
        playfield[tetroRow][tetroColumn] = tetromino.name;
      }
    }
    draw();
  }

  const filledRows = findFilledRows();
  //   console.log(filledRows);
  setTimeout(() => {
    removeFilledRows(filledRows);
  }, 300);

  generateTetromino();
  isGameRealOver();
  draw();
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
  const oldMatrix = tetromino.matrix;
  const rotatedMatrix = rotateMatrix(tetromino.matrix);
  //   array = rotateMatrix(tetromino.matrix);
  tetromino.matrix = rotatedMatrix;
  if (isValid()) {
    tetromino.matrix = oldMatrix;
  }
  //   draw();
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
