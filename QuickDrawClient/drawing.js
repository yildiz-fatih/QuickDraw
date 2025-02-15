export function startApp() {
  document.getElementById("drawingContainer").classList.remove("hidden");

  setupGrid(16, 24);
  initDrawing();
  initControlButtons();
}

const gridContainer = document.getElementById("grid-container");

function setupGrid(rows, cols) {
  gridContainer.innerHTML = "";
  const totalCells = rows * cols;

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");
    cell.classList.add("grid-cell");
    cell.style.flexBasis = `calc(100% / ${cols})`;
    cell.style.height = `calc(100% / ${rows})`;
    gridContainer.appendChild(cell);
  }
}

function clearGrid() {
  gridContainer.querySelectorAll(".grid-cell").forEach((cell) => {
    cell.style.backgroundColor = "transparent";
  });
}

let isDrawing = false;
let currentColor = "black";

function initDrawing() {
  gridContainer.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("grid-cell")) {
      isDrawing = true;
      e.target.style.backgroundColor = currentColor;
    }
  });

  gridContainer.addEventListener("mouseover", (e) => {
    if (isDrawing && e.target.classList.contains("grid-cell")) {
      e.target.style.backgroundColor = currentColor;
    }
  });

  document.addEventListener("mouseup", () => {
    isDrawing = false;
  });
}

function initControlButtons() {
  const sizeButtons = document.querySelectorAll(".size-button");
  sizeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const rows = parseInt(button.dataset.rows);
      const cols = parseInt(button.dataset.cols);
      setupGrid(rows, cols);
    });
  });

  const colorPicker = document.getElementById("colorPicker");
  const clearBtn = document.getElementById("clear");

  colorPicker.addEventListener("input", (e) => {
    currentColor = e.target.value;
  });

  clearBtn.addEventListener("click", () => {
    clearGrid();
  });
}
