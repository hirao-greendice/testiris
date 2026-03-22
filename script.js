const board = document.getElementById("board");
const player = document.getElementById("player");

const gridSize = 8;
const swipeThreshold = 24;

const state = {
  x: 0,
  y: 0,
  touchStartX: 0,
  touchStartY: 0,
};

function isMobileLayout() {
  return window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateBoardSize() {
  const boardSize = Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.9);
  const cellSize = boardSize / gridSize;

  board.style.setProperty("--board-size", `${boardSize}px`);
  board.style.setProperty("--cell-size", `${cellSize}px`);
  document.body.classList.toggle("is-mobile", isMobileLayout());
  renderPlayer();
}

function renderPlayer() {
  const cellSize = parseFloat(getComputedStyle(board).getPropertyValue("--cell-size"));
  const offset = cellSize * 0.15;
  const x = state.x * cellSize + offset;
  const y = state.y * cellSize + offset;
  player.style.transform = `translate(${x}px, ${y}px)`;
}

function movePlayer(dx, dy) {
  state.x = clamp(state.x + dx, 0, gridSize - 1);
  state.y = clamp(state.y + dy, 0, gridSize - 1);
  renderPlayer();
}

function handleKeydown(event) {
  switch (event.key) {
    case "ArrowUp":
      event.preventDefault();
      movePlayer(0, -1);
      break;
    case "ArrowDown":
      event.preventDefault();
      movePlayer(0, 1);
      break;
    case "ArrowLeft":
      event.preventDefault();
      movePlayer(-1, 0);
      break;
    case "ArrowRight":
      event.preventDefault();
      movePlayer(1, 0);
      break;
  }
}

function handlePointerDown(event) {
  if (!isMobileLayout()) {
    return;
  }

  state.touchStartX = event.clientX;
  state.touchStartY = event.clientY;
}

function handlePointerUp(event) {
  if (!isMobileLayout()) {
    return;
  }

  const deltaX = event.clientX - state.touchStartX;
  const deltaY = event.clientY - state.touchStartY;

  if (Math.abs(deltaX) < swipeThreshold && Math.abs(deltaY) < swipeThreshold) {
    return;
  }

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    movePlayer(deltaX > 0 ? 1 : -1, 0);
    return;
  }

  movePlayer(0, deltaY > 0 ? 1 : -1);
}

window.addEventListener("resize", updateBoardSize);
window.addEventListener("keydown", handleKeydown, { passive: false });
window.addEventListener("pointerdown", handlePointerDown);
window.addEventListener("pointerup", handlePointerUp);

updateBoardSize();
