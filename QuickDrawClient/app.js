import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import {clearDOM, hideInDOM, showInDOM} from "./modules/utils";
import { domElements } from "./modules/domElements";
import { state } from "./modules/state";
import * as signalR from "@microsoft/signalr";

// Initialize SignalR connection
const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5286/drawhub")
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

connection.start();

// Event Listeners

// Login form submission
domElements.loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    state.currentUserName = document.getElementById("userNameInput").value;
    connection.invoke("Login", state.currentUserName);

    clearDOM();

    showInDOM(domElements.roomsContainer);

    domElements.userInfoElement.textContent = `Welcome ${state.currentUserName}`;
});

// Show join room form
domElements.joinARoomButton.addEventListener("click", () => {
    hideInDOM(domElements.createRoomForm);
    showInDOM(domElements.joinRoomForm);
});

// Show create room form
domElements.createARoomButton.addEventListener("click", () => {
    hideInDOM(domElements.joinRoomForm);
    showInDOM(domElements.createRoomForm);
});

// Create room submission
domElements.createRoomForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const roomName = document.getElementById("roomNameInput").value;

    connection.invoke("JoinRoom", roomName);

    state.currentRoomName = roomName;
});

// Join room submission
domElements.joinRoomForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const roomName = document.getElementById("roomsOptions").value;

    connection.invoke("JoinRoom", roomName);

    state.currentRoomName = roomName;
})

// Handle available rooms update
connection.on("ReceiveAvailableRooms", (roomNames) => {
    const optionsDropdown = document.getElementById("roomsOptions");
    optionsDropdown.innerHTML = ""; // Clear existing options

    if (Array.isArray(roomNames) && roomNames.length > 0) {
        roomNames.forEach((name) => {
            const option = document.createElement("option");
            option.value = name;
            option.text = name;
            optionsDropdown.appendChild(option);
        });
    }
});

connection.on("RoomJoined", (room) => {
    state.currentRoomName = room.name;
    clearDOM();
    startApp();

    // Build and update the room info message
    domElements.roomInfoElement.textContent = `Users in ${state.currentRoomName}: ${room.users.map(user => user.userName).join(", ")}`;
});

connection.on("RoomLeft", (userNames) => {
    domElements.roomInfoElement.textContent = `Users in ${state.currentRoomName}: ${userNames.join(", ")}`;
});


/* <!-- drawing stuff --> */

let rows = 16;
let cols = 24;

class DrawingData {
    constructor(roomName, cellIndex, color) {
        this.roomName = roomName;
        this.cellIndex = cellIndex;
        this.color = color;
    }
}

connection.on("ReceiveDrawingData", (data) => {
    const cell = domElements.gridContainer.querySelector(`[data-index="${data.cellIndex}"]`);

    cell.style.backgroundColor = data.color;
});

connection.on("ReceiveClearGrid", () => {
    clearGrid();
});


/* **************************** */

function startApp() {
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
function clearGrid() {
    domElements.gridContainer.querySelectorAll(".grid-cell").forEach((cell) => {
        cell.style.backgroundColor = "transparent";
    });
}

let isDrawing = false;
let currentColor = "black";

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