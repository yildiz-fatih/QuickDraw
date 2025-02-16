import * as signalR from "@microsoft/signalr";
import {startApp} from "./drawing";
import {clearDOM, showInDOM, hideInDOM} from "./utils";

// Initial values
let currentUserName = "";
let currentRoomName = "";

// DOM Elements
const infoContainer = document.getElementById("infoContainer");
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
    showInDOM(infoContainer);

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
    let roomInfoMessage = "";
    roomInfoMessage += "Users in " + currentRoomName + ":\n";
    room.users.forEach((user) => {
        roomInfoMessage += user.userName + "\n";
    })
    roomInfoElement.textContent = roomInfoMessage;
});
