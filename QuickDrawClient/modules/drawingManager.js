import {showInDOM} from "./domUtils";
import {domElements} from "./domElements";
import {state} from "./state";
import {connection} from "./signalRService";

let rows = 16;
let cols = 24;
let isDrawing = false;
let currentColor = "black";

export class DrawingData {
    constructor(roomName, cellIndex, color) {
        this.roomName = roomName;
        this.cellIndex = cellIndex;
        this.color = color;
    }
}

export function initializeDrawing() {
    showInDOM(document.getElementById("drawingContainer"))

    setupGrid();
    initDrawing();
    initControlButtons();
}

function setupGrid() {
    domElements.gridContainer.innerHTML = "";
    const totalCells = rows * cols;

    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement("div");
        cell.classList.add("grid-cell");
        cell.style.flexBasis = `calc(100% / ${cols})`;
        cell.style.height = `calc(100% / ${rows})`;

        cell.setAttribute("data-index", i);

        domElements.gridContainer.appendChild(cell);
    }
}

/* not real time yet! */
export function clearGrid() {
    domElements.gridContainer.querySelectorAll(".grid-cell").forEach((cell) => {
        cell.style.backgroundColor = "transparent";
    });
}

function initDrawing() {
    domElements.gridContainer.addEventListener("mousedown", (e) => {
        if (e.target.classList.contains("grid-cell")) {
            isDrawing = true;
            e.target.style.backgroundColor = currentColor;

            const cellIndex = parseInt(e.target.getAttribute("data-index"));
            const drawingData = {
                roomName: state.currentRoomName,
                cellIndex: cellIndex,
                color: currentColor
            };
            connection.invoke("BroadcastDrawingData", drawingData);
        }
    });

    domElements.gridContainer.addEventListener("mouseover", (e) => {
        if (isDrawing && e.target.classList.contains("grid-cell")) {
            e.target.style.backgroundColor = currentColor;

            const cellIndex = parseInt(e.target.getAttribute("data-index"));
            const drawingData = {
                roomName: state.currentRoomName,
                cellIndex: cellIndex,
                color: currentColor
            };
            connection.invoke("BroadcastDrawingData", drawingData);
        }
    });

    document.addEventListener("mouseup", () => {
        isDrawing = false;
    });
}

function initControlButtons() {
    const colorPicker = document.getElementById("colorPicker");
    const clearBtn = document.getElementById("clear");

    colorPicker.addEventListener("input", (e) => {
        currentColor = e.target.value;
    });

    clearBtn.addEventListener("click", () => {
        clearGrid();

        connection.invoke("BroadcastClearGrid", state.currentRoomName);
    });
}