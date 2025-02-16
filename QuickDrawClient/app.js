import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import * as signalR from "@microsoft/signalr";
import {clearDOM, hideInDOM, showInDOM} from "./utils";

// Initial values
let currentUserName = "";
let currentRoomName = "";

// DOM Elements
const userInfoElement = document.getElementById("userInfo");
const roomInfoElement = document.getElementById("roomInfo");

const roomsContainer = document.getElementById("roomsContainer");

const loginForm = document.getElementById("loginForm");
const joinRoomForm = document.getElementById("joinRoomForm");
const createRoomForm = document.getElementById("createRoomForm");

const joinARoomButton = document.getElementById("joinARoomButton");
const createARoomButton = document.getElementById("createARoomButton");

// Initialize SignalR connection
const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5286/drawhub")
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

connection.start();

// Event Listeners

// Login form submission
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    currentUserName = document.getElementById("userNameInput").value;
    connection.invoke("Login", currentUserName);

    clearDOM();

    showInDOM(roomsContainer);

    userInfoElement.textContent = `Welcome ${currentUserName}`;
});

// Show join room form
joinARoomButton.addEventListener("click", () => {
    hideInDOM(createRoomForm);
    showInDOM(joinRoomForm);
});

// Show create room form
createARoomButton.addEventListener("click", () => {
    hideInDOM(joinRoomForm);
    showInDOM(createRoomForm);
});

// Create room submission
createRoomForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const roomName = document.getElementById("roomNameInput").value;

    connection.invoke("JoinRoom", roomName);

    currentRoomName = roomName;
});

// Join room submission
joinRoomForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const roomName = document.getElementById("roomsOptions").value;

    connection.invoke("JoinRoom", roomName);

    currentRoomName = roomName;
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
    currentRoomName = room.name;
    clearDOM();
    startApp();

    // Build and update the room info message
    roomInfoElement.textContent = `Users in ${currentRoomName}: ${room.users.map(user => user.userName).join(", ")}`;
});

connection.on("RoomLeft", (userNames) => {
    roomInfoElement.textContent = `Users in ${currentRoomName}: ${userNames.join(", ")}`;
});


/* <!-- drawing stuff --> */

let rows = 16;
let cols = 24;

const gridContainer = document.getElementById("grid-container");

class DrawingData {
    constructor(roomName, cellIndex, color) {
        this.roomName = roomName;
        this.cellIndex = cellIndex;
        this.color = color;
    }
}

connection.on("ReceiveDrawingData", (data) => {
    const cell = gridContainer.querySelector(`[data-index="${data.cellIndex}"]`);

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
    gridContainer.innerHTML = "";
    const totalCells = rows * cols;

    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement("div");
        cell.classList.add("grid-cell");
        cell.style.flexBasis = `calc(100% / ${cols})`;
        cell.style.height = `calc(100% / ${rows})`;

        cell.setAttribute("data-index", i);

        gridContainer.appendChild(cell);
    }
}

/* not real time yet! */
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

            const cellIndex = parseInt(e.target.getAttribute("data-index"));
            const drawingData = {
                roomName: currentRoomName,
                cellIndex: cellIndex,
                color: currentColor
            };
            connection.invoke("BroadcastDrawingData", drawingData);
        }
    });

    gridContainer.addEventListener("mouseover", (e) => {
        if (isDrawing && e.target.classList.contains("grid-cell")) {
            e.target.style.backgroundColor = currentColor;

            const cellIndex = parseInt(e.target.getAttribute("data-index"));
            const drawingData = {
                roomName: currentRoomName,
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

        connection.invoke("BroadcastClearGrid", currentRoomName);
    });
}