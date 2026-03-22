const board = document.getElementById("board");
const player = document.getElementById("player");

const gridColumns = 10;
const gridRows = 15;
const dragThresholdRatio = 1.0;
const moveDurationMs = 80;

const state = {
  x: 0,
  y: 0,
  isMoving: false,
  moveQueue: [],
  isDragging: false,
  pointerId: null,
  lastPointerX: 0,
  lastPointerY: 0,
};

function isMobileLayout() {
  return window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateBoardSize() {
  const widthLimit = window.innerWidth * 0.9;
  const heightLimit = window.innerHeight * (isMobileLayout() ? 0.82 : 0.9);
  const cellSize = Math.max(1, Math.floor(Math.min(widthLimit / gridColumns, heightLimit / gridRows)));
  const boardWidth = cellSize * gridColumns;
  const boardHeight = cellSize * gridRows;

  board.style.setProperty("--board-width", `${boardWidth}px`);
  board.style.setProperty("--board-height", `${boardHeight}px`);
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

function getDragThreshold() {
  const cellSize = parseFloat(getComputedStyle(board).getPropertyValue("--cell-size"));
  return Math.max(40, cellSize * dragThresholdRatio);
}

function processNextMove() {
  if (state.isMoving || state.moveQueue.length === 0) {
    return;
  }

  const { dx, dy } = state.moveQueue.shift();
  const nextX = clamp(state.x + dx, 0, gridColumns - 1);
  const nextY = clamp(state.y + dy, 0, gridRows - 1);

  if (nextX === state.x && nextY === state.y) {
    processNextMove();
    return;
  }

  state.x = nextX;
  state.y = nextY;
  state.isMoving = true;
  renderPlayer();
  window.setTimeout(() => {
    state.isMoving = false;
    processNextMove();
  }, moveDurationMs);
}

function queueMove(dx, dy) {
  state.moveQueue.push({ dx, dy });
  processNextMove();
}

function moveFromDrag(event) {
  const dragThreshold = getDragThreshold();
  const deltaX = event.clientX - state.lastPointerX;
  const deltaY = event.clientY - state.lastPointerY;

  if (Math.abs(deltaX) < dragThreshold && Math.abs(deltaY) < dragThreshold) {
    return;
  }

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    queueMove(deltaX > 0 ? 1 : -1, 0);
    state.lastPointerX = event.clientX;
    state.lastPointerY = event.clientY;
    return;
  }

  queueMove(0, deltaY > 0 ? 1 : -1);
  state.lastPointerX = event.clientX;
  state.lastPointerY = event.clientY;
}

function handleKeydown(event) {
  switch (event.key) {
    case "ArrowUp":
      event.preventDefault();
      queueMove(0, -1);
      break;
    case "ArrowDown":
      event.preventDefault();
      queueMove(0, 1);
      break;
    case "ArrowLeft":
      event.preventDefault();
      queueMove(-1, 0);
      break;
    case "ArrowRight":
      event.preventDefault();
      queueMove(1, 0);
      break;
  }
}

function handlePointerDown(event) {
  if (event.pointerType === "mouse" && event.button !== 0) {
    return;
  }

  state.isDragging = true;
  state.pointerId = event.pointerId;
  state.lastPointerX = event.clientX;
  state.lastPointerY = event.clientY;
}

function handlePointerMove(event) {
  if (!state.isDragging || event.pointerId !== state.pointerId) {
    return;
  }

  if (event.pointerType === "mouse" && (event.buttons & 1) === 0) {
    clearDraggingState();
    return;
  }

  moveFromDrag(event);
}

function clearDraggingState() {
  state.isDragging = false;
  state.pointerId = null;
  state.lastPointerX = 0;
  state.lastPointerY = 0;
}

function handlePointerUp(event) {
  if (!state.isDragging || event.pointerId !== state.pointerId) {
    return;
  }

  clearDraggingState();
}

window.addEventListener("resize", updateBoardSize);
window.addEventListener("keydown", handleKeydown, { passive: false });
window.addEventListener("pointerdown", handlePointerDown);
window.addEventListener("pointermove", handlePointerMove);
window.addEventListener("pointerup", handlePointerUp);
window.addEventListener("pointercancel", handlePointerUp);

updateBoardSize();
