export const PLAYFIELD_COLUMNS = 10;
export const PLAYFIELD_ROWS = 20;

export const NEXTFIELD_COLUMNS = 6;
export const NEXTFIELD_ROWS = 3;

export const TETROMINO_NAMES = ["O", "L", "I", "J", "S", "Z", "T", "Q"];

export const TETROMINOES = {
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

export const gameOverBlock = document.querySelector(".game-over");

export function getRandomElement(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

export function convertPositionToIndex(row, column) {
  return row * PLAYFIELD_COLUMNS + column;
}
