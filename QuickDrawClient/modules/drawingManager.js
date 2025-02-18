/*
 * TODO
 * Optimize rendering efficiency
 */
import { showInDOM } from "./domUtils";
import { domElements } from "./domElements";
import { state } from "./state";
import { connection } from "./signalRService";

let isDrawing = false;
let currentColor = domElements.colorPicker.value;

export class DrawingData {
  constructor(row, column, color, roomName) {
    this.row = row;
    this.column = column;
    this.color = color;
    this.roomName = roomName;
  }
}

export function initializeDrawing(grid) {
  showInDOM(domElements.drawingContainer);

  drawGrid(grid);
  initializeDrawingEvents();
  initControlButtons();
}

function drawGrid(grid) {
  domElements.gridContainer.innerHTML = "";

  grid.cells.forEach(cell => {
    const cellElement = document.createElement("div");
    cellElement.classList.add("grid-cell");

    cellElement.style.flexBasis = `calc(100% / ${grid.width})`;
    cellElement.style.height = `calc(100% / ${grid.height})`;

    cellElement.style.backgroundColor = cell.color;

    cellElement.setAttribute("data-row", cell.row);
    cellElement.setAttribute("data-column", cell.column);

    domElements.gridContainer.appendChild(cellElement);
  });
}

export function clearGrid() {
  domElements.gridContainer.querySelectorAll(".grid-cell").forEach((cell) => {
    cell.style.backgroundColor = "#D8D8D8";
  });
}

function initializeDrawingEvents() {
  domElements.gridContainer.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("grid-cell")) {
      isDrawing = true;
      e.target.style.backgroundColor = currentColor;

      const row = parseInt(e.target.getAttribute("data-row"));
      const column = parseInt(e.target.getAttribute("data-column"));
      const drawingData = new DrawingData(
          row,
          column,
          currentColor,
          state.currentRoomName
      );

      connection.invoke("UpdateCellRequest", drawingData);
    }
  });

  domElements.gridContainer.addEventListener("mouseover", (e) => {
    if (isDrawing && e.target.classList.contains("grid-cell")) {
      e.target.style.backgroundColor = currentColor;

      const row = parseInt(e.target.getAttribute("data-row"));
      const column = parseInt(e.target.getAttribute("data-column"));
      const drawingData = new DrawingData(
          row,
          column,
          currentColor,
          state.currentRoomName
      );

      connection.invoke("UpdateCellRequest", drawingData);
    }
  });

  document.addEventListener("mouseup", () => {
    isDrawing = false;
  });
}

export function drawCell(row, column, color) {
  const cell = domElements.gridContainer.querySelector(
      `[data-row="${row}"][data-column="${column}"]`
  );
  cell.style.backgroundColor = color;
}

function initControlButtons() {
  domElements.colorPicker.addEventListener("input", (e) => {
    currentColor = e.target.value;
  });

  domElements.clearBtn.addEventListener("click", () => {
    clearGrid();

    connection.invoke("ClearGridRequest", state.currentRoomName);
  });
}
